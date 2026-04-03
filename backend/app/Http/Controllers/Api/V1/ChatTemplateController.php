<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreChatTemplateRequest;
use App\Http\Requests\UpdateChatTemplateRequest;
use App\Http\Resources\ChatTemplateResource;
use App\Models\ChatTemplate;
use App\Services\ChatTemplateService;

class ChatTemplateController extends Controller
{
    public function __construct(private readonly ChatTemplateService $chatTemplateService)
    {
    }

    public function index()
    {
        return ChatTemplateResource::collection($this->chatTemplateService->paginate());
    }

    public function store(StoreChatTemplateRequest $request): ChatTemplateResource
    {
        $template = ChatTemplate::query()->create($request->validated());

        return new ChatTemplateResource($template);
    }

    public function update(UpdateChatTemplateRequest $request, ChatTemplate $chatTemplate): ChatTemplateResource
    {
        $chatTemplate->update($request->validated());

        return new ChatTemplateResource($chatTemplate->refresh());
    }

    public function destroy(ChatTemplate $chatTemplate)
    {
        $chatTemplate->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
