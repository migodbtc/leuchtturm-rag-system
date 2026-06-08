<?php

use App\Http\Controllers\ConversationController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\Settings\AccountController;
use App\Http\Controllers\Settings\DatabaseController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    // Default redirects
    Route::redirect('settings', 'settings/profile');

    // Settings
    Route::get('settings/profile', [ProfileController::class, 'edit'])
        ->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])
        ->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])
        ->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])
        ->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])
        ->name('password.update');

    Route::get('settings/database', [DatabaseController::class, 'show'])
        ->name('database.show');
    Route::get('settings/account', [AccountController::class, 'show'])
        ->name('account.show');
});


