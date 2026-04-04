<?php

namespace App\Policies;

use App\Models\ChatTemplate;
use App\Models\User;

class ChatTemplatePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ChatTemplate $chatTemplate): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $chatTemplate->user_id === null || (int) $chatTemplate->user_id === (int) $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, ChatTemplate $chatTemplate): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($chatTemplate->user_id === null) {
            return false;
        }

        return (int) $chatTemplate->user_id === (int) $user->id;
    }

    public function delete(User $user, ChatTemplate $chatTemplate): bool
    {
        return $this->update($user, $chatTemplate);
    }
}
