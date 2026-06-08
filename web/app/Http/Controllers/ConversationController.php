<?php

namespace App\Http\Controllers;

use App\Jobs\RagQueryTransfer;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ConversationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
{
    /** @var \App\Models\User $user */
    $user = Auth::user();

    $search = $request->query('search', '');

    $conversations = $user->conversations()
        ->latest()
        ->when($search, fn($q) => $q->where('title', 'like', "%{$search}%"))
        ->get();

    return Inertia::render('chat/index', [
        'conversations' => $conversations,
        'filters' => ['search' => $search],  
    ]);
}

    /**
     * Show the form for creating a new resource.
     * - This would the new chat (default redirect screen) page for
     * the user to see.
     */
    public function create()
    {
        return Inertia::render('chat/new');
    }

    /**
     * Store a newly created resource in storage.
     * Called from the New Chat page (POST /chat).
     * Creates the conversation, saves the first user message,
     * dispatches the RAG job, then redirects to the conversation
     * with a flashed pendingMessageId so the frontend starts polling.
     */
    public function store(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
        ]);

        // Derive a title from the first ~60 chars of the message
        $title = Str::limit($validated['message'], 60);

        $conversation = $user->conversations()->create(['title' => $title]);

        $message = $conversation->messages()->create([
            'owner'   => 'user',
            'message' => $validated['message'],
        ]);

        RagQueryTransfer::dispatch($conversation, $message);

        return redirect()->route('chat.show', $conversation->id)
            ->with('pendingMessageId', $message->id);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Validation: user authenticated?
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user) {
            abort(401, 'Unauthenticated');
        }

        // Validation: conversation exists?
        $conversation = $user->conversations()->find($id);
        if (!$conversation) {
            abort(404, 'Conversation not found');
        };

        return Inertia::render('chat/single', [
            'conversation'      => $conversation,
            'messages'          => $conversation->messages()->oldest()->get(),
            'pendingMessageId'  => session('pendingMessageId'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user) {
            abort(401, 'Unauthenticated');
        }

        $conversation = $user->conversations()->find($id);
        if (!$conversation) {
            abort(404, 'Conversation not found');
        }

        // Delete child messages first so SQLite FK constraint is satisfied
        // even on databases that were created without ON DELETE CASCADE.
        $conversation->messages()->delete();
        $conversation->delete();

        return redirect()->route('chat.index')
            ->with('success', 'Conversation deleted successfully');
    }
}
