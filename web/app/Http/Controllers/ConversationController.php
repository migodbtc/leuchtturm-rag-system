<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConversationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // $conversations = auth()->user()->conversations()->latest()->get();
        // return Inertia::render('chat/index', [
        //     'conversations' => $conversations,
        // ]);
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
     */
    public function store(Request $request)
    {
        //
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
                'conversation'      =>      $conversation,
                'messages'          =>      $conversation->messages,
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
        //
    }
}
