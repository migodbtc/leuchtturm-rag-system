<?php

namespace App\Http\Controllers;

use App\Jobs\RagQueryTransfer;
use Illuminate\Support\Facades\Auth;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    //
    // Checks the status of an existing message
    //
    public function status(string $id)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $message = Message::with('conversation')->findOrFail($id);

        // Security: ensure the message belongs to this user's conversation
        abort_unless($message->conversation->user_id === $user->id, 403);

        // Look for a bot reply created after the user's message in the same conversation
        $botReply = Message::where('conversation_id', $message->conversation_id)
            ->where('owner', 'bot')
            ->where('id', '>', $message->id)
            ->first();

        return response()->json([
            'pending'   => $botReply === null,
            'bot_reply' => $botReply,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     * Route: POST /chat/{chat}  (chat.query)
     */
    public function store(Request $request, string $chat)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Ensure the conversation belongs to the authenticated user
        $conversation = $user->conversations()->findOrFail($chat);

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
        ]);

        // Persist the user message immediately
        $message = $conversation->messages()->create([
            'owner'   => 'user',
            'message' => $validated['message'],
        ]);

        // Hand off to the queue — the job calls FastAPI and saves the bot reply
        RagQueryTransfer::dispatch($conversation, $message);

        return response()->json($message, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
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
        //
    }

    
}
