<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\ConversationController;
use App\Http\Controllers\MessageController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('/new', [ConversationController::class, 'create'])->name('auth.default');
    Route::redirect('/', '/new');

    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('chat', ConversationController::class);
    Route::resource('chat.messages', MessageController::class)->shallow();
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
