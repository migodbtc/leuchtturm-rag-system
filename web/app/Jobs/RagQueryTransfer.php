<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

use App\Models\Conversation;
use App\Models\Message;


class RagQueryTransfer implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Conversation $conversation,
        public Message $message,
    ) {}

    public function handle(): void
    {
        $ragUrl = rtrim(config('services.rag.url'), '/') . '/rag/query';

        try {
            $response = Http::timeout(120)->post($ragUrl, [
                'query' => $this->message->message,
            ]);

            if ($response->successful() && $response->json('status') === 'ok') {
                $botReply = $response->json('response');
            } else {
                Log::error('RAG query failed', [
                    'status'  => $response->status(),
                    'body'    => $response->body(),
                ]);
                $botReply = 'Sorry, I could not process your request. Please try again.';
            }
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('RAG service unreachable', ['error' => $e->getMessage()]);
            $botReply = 'The RAG service is currently unavailable. Please try again later.';
        }

        $this->conversation->messages()->create([
            'owner'   => 'bot',
            'message' => $botReply,
        ]);
    }
}
