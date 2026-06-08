<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\ConversationController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\RagCallbackController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('/new', [ConversationController::class, 'create'])->name('auth.default');
    Route::redirect('/', '/new');

    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('chat/all', [ConversationController::class, 'index'])
        ->name('chat.all');

    Route::resource('chat', ConversationController::class)
        ->only(['index', 'create', 'store', 'show', 'destroy'])
        ->whereNumber('chat');
    Route::resource('chat.messages', MessageController::class)->shallow();

    Route::post('chat/{chat}/message', [MessageController::class, 'store'])
        ->name('message.send');

    Route::get('messages/{message}/status', [MessageController::class, 'status'])
        ->name('messages.status');
});

Route::post('internal/rag-callback', [RagCallbackController::class, 'store'])
    ->middleware(['throttle:60,1', 'signed'])
    ->name('internal.rag-callback');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
