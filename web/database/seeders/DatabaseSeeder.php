<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Conversation;
use App\Models\Message;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
            # Test user
            $testUser = User::factory()->create([
                'name'          =>      'Gustavo Fring Batumbakal',
                'email'         =>      'gfbatumbakal@gmail.com',
                'password'      =>      Hash::make('lospolloshermanos'),
            ]);

            # Mock data for test user
            Conversation::factory(5)->for($testUser)->create();
            Message::factory(30)->create([
                'conversation_id' => Conversation::where('user_id', $testUser->id)->inRandomOrder()->first()->id,
            ]);

            # Other mock data
            User::factory(10)->create();
            Conversation::factory(15)->create();
            Message::factory(90)->create();
            }
}
