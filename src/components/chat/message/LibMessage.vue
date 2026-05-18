<template>
    <slot></slot>
    <div
        v-if="
            (isObjectEmpty(message.content) || message.type === 'ciphertext' || message.type === 'call') &&
            !message.special
        "
        class="flex w-full lg:px-2 rounded-lg transition-colors duration-200"
        :class="{
            'justify-end': isOwner,
            'justify-start': !isOwner,
            'z-20': showPopper,
            'pt-1.5': shouldDisplayAvatar(message, nextMessage),
            'pt-4': nextMessage && nextMessage.metadata && nextMessage.metadata.reaction,
            'bg-gray-400/5 dark:bg-sky-200/20 py-1': isMessageSelected
        }"
    >
        <!-- Forward checkbox -->
        <button
            v-if="forwardMode?.active && !message.internal && canForwardMessage"
            data-test="forward-message-checkbox"
            type="button"
            class="flex items-center mr-2 focus:outline-none"
            @click.stop="emit('toggleForwardSelection', message)"
        >
            <div
                class="size-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors"
                :class="
                    isMessageSelected
                        ? 'bg-primary border-primary'
                        : 'border-gray-400 dark:bg-gray-500/60 dark:border-gray-600 hover:border-primary'
                "
            >
                <svg
                    v-if="isMessageSelected"
                    class="size-3.5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
            </div>
        </button>

        <!-- Left avatar (received messages) -->
        <template v-if="!isOwner && shouldDisplayAvatar(message, nextMessage) && message.content?.sender">
            <div>
                <component
                    :is="C.Avatar"
                    :icon-url="leftAvatarUrl"
                    class="mr-4 mt-1 size-8 select-none"
                    @click="emit('avatarClick', leftAvatarUrl)"
                />
            </div>
        </template>
        <div v-else-if="!isInfo" class="w-12"></div>

        <!-- Message bubble -->
        <div
            :id="message.id"
            class="relative min-w-[100px] rounded-[7.5px] p-1.5 px-2 pb-0 text-sm"
            :class="{
                'internal-owner': message.internal,
                'message-sms': message.type === 'sms',
                'message-owner': isOwner && message.type !== 'sms',
                'message-received': !isOwner && message.type !== 'sms',
                'transition duration-150 ease-in-out': message.type === 'text',
                'max-w-[80%] md:max-w-[60%]': !isInfo
            }"
            @click.right="open = !open"
            @mouseenter="showPopper = true"
            @mouseleave="((showPopper = false), (open = false))"
            @touchstart="startTouch"
            @touchend="endTouch"
            @contextmenu.prevent="handleContextMenu($event)"
        >
            <!-- Arrow dot -->
            <div
                v-if="shouldDisplayAvatar(message, nextMessage)"
                class="absolute top-[18px] z-0 h-3 w-2.5"
                :class="isOwner ? '-right-[8px] message-dot-owner reflex' : 'message-dot-received -left-[8px]'"
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    xmlns="http://www.w3.org/2000/svg"
                    :class="messageIcon"
                >
                    <path
                        d="M2.08716 0.990608C6.96945 3.99222 14.3729 -1.53342 13.0005 3.49993C11.9288 7.43005 15.5661 14.0304 12.5 13.5001C11.2754 13.2882 7.30071 12.6987 4.10282 9.18332C1.80094 6.65292 0.995844 3.64548 0.812781 1.59225C0.755256 0.947065 1.53536 0.651363 2.08716 0.990608Z"
                        fill="currentColor"
                    />
                </svg>
            </div>

            <!-- Header (sender name) -->
            <header v-if="showHeader" :class="headerClass">
                {{ headerText }}
            </header>

            <main class="flex w-full flex-col">
                <!-- Excluded message -->
                <div
                    v-if="message.stage === 'excluded'"
                    class="flex select-none text-gray-400 opacity-70 dark:text-blue-800"
                >
                    <section class="flex items-center justify-center">
                        <svg
                            class="mb-0.3 size-4"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                            x="0px"
                            y="0px"
                            width="100"
                            height="100"
                            viewBox="0 0 50 50"
                        >
                            <path
                                d="M25,2C12.317,2,2,12.318,2,25s10.317,23,23,23s23-10.318,23-23S37.683,2,25,2z M7,25c0-4.062,1.371-7.8,3.65-10.815 L35.815,39.35C32.8,41.629,29.062,43,25,43C15.075,43,7,34.925,7,25z M39.35,35.815L14.185,10.65C17.2,8.371,20.938,7,25,7 c9.925,0,18,8.075,18,18C43,29.062,41.629,32.8,39.35,35.815z"
                            ></path>
                        </svg>
                        <p class="p-1 italic">Mensagem apagada</p>
                    </section>
                </div>

                <!-- Forward tag -->
                <div v-if="message.is_forward" class="flex items-center gap-1.5 mb-1.5 text-xs opacity-80">
                    <svg
                        class="size-3.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            d="M5.027 10.9a8.729 8.729 0 0 1 6.422-3.62v-1.2A2.061 2.061 0 0 1 12.61 4.2a1.986 1.986 0 0 1 2.104.23l5.491 4.308a2.11 2.11 0 0 1 .588 2.566 2.109 2.109 0 0 1-.588.734l-5.489 4.308a1.983 1.983 0 0 1-2.104.228 2.065 2.065 0 0 1-1.16-1.876v-.942c-5.33 1.284-6.212 5.251-6.25 5.441a1 1 0 0 1-.923.806h-.06a1.003 1.003 0 0 1-.955-.7A10.221 10.221 0 0 1 5.027 10.9Z"
                        />
                    </svg>
                    <span>Encaminhada</span>
                </div>

                <!-- Quoted message -->
                <component
                    v-if="C.chatQuote && message.quoted && message.quoted.content"
                    :is="C.chatQuote"
                    :chat-id="message.quoted.chat"
                    :attendant="message.quoted.sent_by"
                    :is-message="true"
                    :message-id="message.quoted.id"
                    :message="message.quoted.content"
                    @go="(val, chatId) => emit('goToMessage', val, chatId)"
                />

                <!-- Ad message -->
                <component
                    v-if="C.adMessage && message.content?.is_ad"
                    :is="C.adMessage"
                    :from_me="message.from_me"
                    :message="message.content"
                />

                <!-- Comment message (optional, attendance-screen only) -->
                <component
                    v-if="C.commentMessage && message.content?.post_info"
                    :is="C.commentMessage"
                    :from_me="message.from_me"
                    :message="message.content"
                />

                <!-- SMS message -->
                <div v-if="message.type === 'sms'" class="flex flex-col">
                    <span
                        class="inline-flex items-center gap-1 self-end rounded-full bg-violet-100/15 px-2 text-[9px] dark:text-violet-600 dark:bg-violet-600/15 font-bold uppercase tracking-widest text-violet-100"
                    >
                        SMS
                    </span>
                    <component :is="C.Markdown" :content="message.content.text" />
                </div>

                <!-- Text message -->
                <component
                    v-else-if="
                        message.type === 'text' && !message.content?.is_ad && !message.content?.post_info
                    "
                    :is="C.Markdown"
                    :class="message.stage === 'excluded' ? 'opacity-70 text-gray-400' : ''"
                    :content="message.content.text"
                />

                <!-- List description -->
                <component
                    v-else-if="message.type === 'list' && C.Markdown"
                    :is="C.Markdown"
                    :content="message.content.description"
                />

                <!-- Call message -->
                <component
                    v-else-if="message.type === 'call' && C.CallMessage"
                    :is="C.CallMessage"
                    :content="message.content"
                />

                <!-- Location -->
                <div v-else-if="message.type === 'location' && C.locationMap">
                    <component :is="C.locationMap" :map="message.content" :map-id="`${message.id}-map`" />
                </div>

                <!-- Ciphertext -->
                <component v-else-if="message.type === 'ciphertext' && C.ciphertext" :is="C.ciphertext" />

                <!-- File loading -->
                <component
                    v-else-if="isFileLoading && C.fileLoading"
                    :is="C.fileLoading"
                    :message="message"
                />

                <!-- Audio -->
                <div v-else-if="isAudioMessage" class="relative flex w-full flex-col px-1">
                    <component
                        v-if="C.audioView"
                        :is="C.audioView"
                        :audio="message.content.data64 || message.content.url"
                        :is-owner="isOwner"
                        :full-width="!!(message.quoted && message.quoted.content)"
                        :avatar="audioAvatar"
                        @current-time="handleCurrentTime"
                    />
                    <div v-if="message.isTranscripting" class="flex items-center justify-center space-x-1 italic">
                        <svg
                            fill="none"
                            class="size-7 animate-spin"
                            viewBox="0 0 32 32"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                clip-rule="evenodd"
                                d="M15.165 8.53a.5.5 0 01-.404.58A7 7 0 1023 16a.5.5 0 011 0 8 8 0 11-9.416-7.874.5.5 0 01.58.404z"
                                fill="currentColor"
                                fill-rule="evenodd"
                            />
                        </svg>
                        <div>Transcrevendo...</div>
                    </div>
                    <div
                        v-if="message.metadata?.transcripted_text && !message.isTranscripting"
                        :id="`transcriptedMessage${message.id}`"
                        class="max-h-[200px] overflow-auto pb-1 pr-2 text-start opacity-90"
                    >
                        <em>"{{ message.metadata?.transcripted_text }}"</em>
                    </div>
                </div>

                <!-- Group messages -->
                <component
                    v-else-if="C.groupMessages && message.items && message.items.length > 1"
                    :is="C.groupMessages"
                    :message="message"
                />

                <!-- File / image / video / document -->
                <template
                    v-else-if="
                        (message.type === 'file' ||
                            message.type === 'image' ||
                            message.type === 'video' ||
                            message.type === 'document') &&
                        !message.items
                    "
                >
                    <component
                        v-if="C.MessageFileRenderer"
                        :is="C.MessageFileRenderer"
                        :message="message"
                    />
                    <slot v-else name="file-content" :message="message" />
                </template>

                <!-- vCard -->
                <component
                    v-else-if="message.type === 'vcard' && C.vCard"
                    :is="C.vCard"
                    :contact="message.content.vcard_info"
                />

                <!-- Footer: duration · time · stage -->
                <div
                    :class="message.content?.duration ? 'justify-between' : 'justify-end pl-2'"
                    class="flex select-none items-center space-x-1 text-[10px]"
                >
                    <section v-if="message.content?.duration" class="flex items-center gap-1">
                        <Popper
                            offset-distance="2"
                            :hover="true"
                            content="Transcrever áudio"
                            placement="top"
                            class="text-[14px]"
                        >
                            <button
                                v-if="isAudioMessage && !message.metadata?.transcripted_text"
                                :disabled="message.isTranscripting"
                                class="stage-mark mt-[6px] hover:text-primary"
                                @click.stop="emit('transcriptAudio', message)"
                            >
                                <svg
                                    class="size-5.5"
                                    clip-rule="evenodd"
                                    fill-rule="evenodd"
                                    stroke-linejoin="round"
                                    stroke-miterlimit="2"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fill="currentColor"
                                        d="m11.239 15.533c-1.045 3.004-1.238 3.451-1.238 3.84 0 .441.385.627.627.627.272 0 1.108-.301 3.829-1.249zm.888-.888 3.22 3.22 6.408-6.401c.163-.163.245-.376.245-.591 0-.213-.082-.427-.245-.591-.58-.579-1.458-1.457-2.039-2.036-.163-.163-.377-.245-.591-.245-.213 0-.428.082-.592.245zm-3.127-.895c0-.402-.356-.75-.75-.75-2.561 0-2.939 0-5.5 0-.394 0-.75.348-.75.75s.356.75.75.75h5.5c.394 0 .75-.348.75-.75zm5-3c0-.402-.356-.75-.75-.75-2.561 0-7.939 0-10.5 0-.394 0-.75.348-.75.75s.356.75.75.75h10.5c.394 0 .75-.348.75-.75zm0-3c0-.402-.356-.75-.75-.75-2.561 0-7.939 0-10.5 0-.394 0-.75.348-.75.75s.356.75.75.75h10.5c.394 0 .75-.348.75-.75zm0-3c0-.402-.356-.75-.75-.75-2.561 0-7.939 0-10.5 0-.394 0-.75.348-.75.75s.356.75.75.75h10.5c.394 0 .75-.348.75-.75z"
                                        fill-rule="nonzero"
                                    />
                                </svg>
                            </button>
                        </Popper>
                        <p class="opacity-80">
                            {{ formatTime(message.content.duration) }} -
                            {{ message.content.currentTime ? formatTime(message.content.currentTime) : "00:00" }}
                        </p>
                    </section>

                    <div class="flex items-center gap-1">
                        <Popper :arrow="true" hover placement="top">
                            <svg
                                v-if="message.internal"
                                class="size-3.5 text-white/50 dark:text-black/40"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M12 6a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm-1.5 8a4 4 0 0 0-4 4 2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-3Zm6.82-3.096a5.51 5.51 0 0 0-2.797-6.293 3.5 3.5 0 1 1 2.796 6.292ZM19.5 18h.5a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-1.1a5.503 5.503 0 0 1-.471.762A5.998 5.998 0 0 1 19.5 18ZM4 7.5a3.5 3.5 0 0 1 5.477-2.889 5.5 5.5 0 0 0-2.796 6.293A3.501 3.501 0 0 1 4 7.5ZM7.1 12H6a4 4 0 0 0-4 4 2 2 0 0 0 2 2h.5a5.998 5.998 0 0 1 3.071-5.238A5.505 5.505 0 0 1 7.1 12Z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                            <template #content>
                                <div class="w-32 text-center">Mensagem visível apenas para outros atendentes</div>
                            </template>
                        </Popper>

                        <main class="flex items-center space-x-1">
                            <p class="flex items-center gap-1 opacity-80">
                                <span v-if="message.content?.history?.length > 0">Editada</span>
                                {{ message?.sent_at?.split("T")[1]?.slice(0, 5) || "--:--" }}
                            </p>
                            <section v-if="isOwner">
                                <svg
                                    v-if="message.stage === 'received' || message.stage === 'sent'"
                                    class="stage-mark"
                                    width="15"
                                    height="12"
                                    viewBox="0 0 20 12"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M13.7368 1.08403C14.0083 1.2372 14.0817 1.54764 13.9007 1.7774L6.80982 10.7773C6.71162 10.902 6.55255 10.9828 6.37638 10.9976C6.20021 11.0123 6.0255 10.9595 5.90032 10.8536L1.17307 6.85357C0.942309 6.65831 0.942309 6.34173 1.17307 6.14647C1.40384 5.95121 1.77798 5.95121 2.00874 6.14647L6.22631 9.71519L12.9174 1.2227C13.0984 0.992939 13.4653 0.930852 13.7368 1.08403Z" fill="currentColor" />
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M18.7368 1.08403C19.0083 1.2372 19.0817 1.54764 18.9007 1.7774L11.8098 10.7773C11.7116 10.902 11.5526 10.9828 11.3764 10.9976C11.2002 11.0123 11.0255 10.9595 10.9003 10.8536L6.17307 6.85357C5.94231 6.65831 5.94231 6.34173 6.17307 6.14647C6.40384 5.95121 6.77798 5.95121 7.00874 6.14647L11.2263 9.71519L17.9174 1.2227C18.0984 0.992939 18.4653 0.930852 18.7368 1.08403Z" fill="currentColor" />
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M13.7368 1.08403C14.0083 1.2372 14.0817 1.54764 13.9007 1.7774L6.80982 10.7773C6.71162 10.902 6.55255 10.9828 6.37638 10.9976C6.20021 11.0123 6.0255 10.9595 5.90032 10.8536L1.17307 6.85357C0.942309 6.65831 0.942309 6.34173 1.17307 6.14647C1.40384 5.95121 1.77798 5.95121 2.00874 6.14647L6.22631 9.71519L12.9174 1.2227C13.0984 0.992939 13.4653 0.930852 13.7368 1.08403Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M18.7368 1.08403C19.0083 1.2372 19.0817 1.54764 18.9007 1.7774L11.8098 10.7773C11.7116 10.902 11.5526 10.9828 11.3764 10.9976C11.2002 11.0123 11.0255 10.9595 10.9003 10.8536L6.17307 6.85357C5.94231 6.65831 5.94231 6.34173 6.17307 6.14647C6.40384 5.95121 6.77798 5.95121 7.00874 6.14647L11.2263 9.71519L17.9174 1.2227C18.0984 0.992939 18.4653 0.930852 18.7368 1.08403Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <svg
                                    v-else-if="message.stage === 'processing'"
                                    class="stage-mark"
                                    width="12"
                                    height="12"
                                    viewBox="0 0 15 12"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M13.7368 1.08403C14.0083 1.2372 14.0817 1.54764 13.9007 1.7774L6.80982 10.7773C6.71162 10.902 6.55255 10.9828 6.37638 10.9976C6.20021 11.0123 6.0255 10.9595 5.90032 10.8536L1.17307 6.85357C0.942309 6.65831 0.942309 6.34173 1.17307 6.14647C1.40384 5.95121 1.77798 5.95121 2.00874 6.14647L6.22631 9.71519L12.9174 1.2227C13.0984 0.992939 13.4653 0.930852 13.7368 1.08403Z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <svg
                                    v-else-if="message.stage === 'failed'"
                                    class="stage-mark size-4"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="12"
                                    height="12"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm7.707-3.707a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293Z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                            </section>
                        </main>
                    </div>
                </div>
            </main>

            <!-- Below content: list / template / button -->
            <component
                v-if="message.type === 'list' && C.listMessage"
                :is="C.listMessage"
                :from_me="message.from_me"
                :message="message.content"
            />
            <component
                v-else-if="message.type === 'template' && C.templateMessage"
                :is="C.templateMessage"
                :from_me="message.from_me"
                :message="message.content"
            />
            <component
                v-else-if="message.type === 'button' && C.buttonMessage"
                :is="C.buttonMessage"
                :content="message.content"
            />

            <!-- Dropdown arrow button -->
            <transition name="fade">
                <button
                    v-show="showPopper"
                    v-if="showDropdownArrow"
                    class="ml-3 absolute right-[1.5px] top-0 flex items-center justify-center pr-1 pt-1"
                    @click="handleArrowClick($event)"
                >
                    <svg
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        :class="{ 'rotate-180': open, 'rotate-0': !open }"
                        class="size-5 rounded bg-gray-800/80 text-white transition-transform duration-200 dark:bg-gray-400"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                        ></path>
                    </svg>
                </button>
            </transition>

            <!-- Slot for app-specific actions (e.g. messageActions dropdown) -->
            <slot name="actions" :message="message" :showPopper="showPopper" :open="open" />

            <!-- Reaction footer -->
            <footer
                v-if="showReactions && message.metadata?.reaction"
                :class="[
                    isOwner ? 'right-2' : '',
                    hoverReaction ? 'w-[45px]' : 'w-[30px]',
                    'absolute -bottom-[21px] z-10 flex items-center rounded-xl border border-base-100 bg-base-200 p-1 py-0.5 transition-all duration-300 dark:bg-base-300'
                ]"
                @mouseenter="hoverReaction = true"
                @mouseleave="hoverReaction = false"
                @touchstart="hoverReaction = true"
                @touchend="hoverReaction = false"
                @touchcancel="hoverReaction = false"
            >
                <p>{{ message.metadata?.reaction }}</p>
                <Transition name="fade">
                    <button
                        v-show="hoverReaction"
                        class="opacity-70 hover:opacity-90"
                        @click="emit('addReaction', '', message)"
                    >
                        <svg
                            class="size-4"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M6 18 17.94 6M18 18 6.06 6"
                            />
                        </svg>
                    </button>
                </Transition>
            </footer>
        </div>

        <!-- Right avatar (sent messages) -->
        <template v-if="isOwner && shouldDisplayAvatar(message, nextMessage)">
            <div>
                <component
                    :is="C.Avatar"
                    :icon-url="message.sent_by ? message.sent_by.photo : botAvatarUrl"
                    class="ml-4 mt-1 size-8 select-none"
                />
            </div>
        </template>
        <div v-else-if="!isInfo" class="w-12"></div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { isAudio, isObjectEmpty, shouldDisplayAvatar, formatTime } from "./messageUtils.js";
import Avatar from "./components/Avatar.vue";
import chatQuote from "./components/chatQuote.vue";
import adMessage from "./components/adMessage.vue";
import listMessage from "./components/listMessage.vue";
import templateMessage from "./components/templateMessage.vue";
import buttonMessage from "./components/buttonMessage.vue";
import locationMap from "./components/locationMap.vue";
import ciphertext from "./components/ciphertext.vue";
import fileLoading from "./components/fileLoading.vue";
import audioView from "./components/audioView.vue";
import groupMessages from "./components/groupMessages.vue";
import MessageFileRenderer from "./components/MessageFileRenderer.vue";
import vCard from "./components/vCard.vue";
import markDown from "./components/markDown.vue";

const C = {
    Avatar,
    chatQuote,
    adMessage,
    listMessage,
    templateMessage,
    buttonMessage,
    locationMap,
    ciphertext,
    fileLoading,
    audioView,
    groupMessages,
    MessageFileRenderer,
    vCard,
    Markdown: markDown,
    CallMessage: null,
    commentMessage: null
};

const props = defineProps({
    message: { type: Object, default: () => ({}) },
    nextMessage: { type: Object, default: () => ({}) },
    isInfo: { type: Boolean, default: false },
    // Store-derived data (injected by the wrapper)
    themeMode: { type: Boolean, default: false },
    attendant: { type: Object, default: null },
    currentChat: { type: Object, default: null },
    // Optional feature flags
    forwardMode: { type: Object, default: null },
    showReactions: { type: Boolean, default: false },
    botAvatarUrl: {
        type: String,
        default: "https://sm-click.s3.amazonaws.com/static/bot-attendance.png"
    }
});

const emit = defineEmits([
    "goToMessage",
    "transcriptAudio",
    "toggleForwardSelection",
    "addReaction",
    "contextMenu",
    "avatarClick"
]);

// ── Internal state ──
const open = ref(false);
const showPopper = ref(false);
const hoverReaction = ref(false);
let touchTimer;

// ── Computed ──
const isOwner = computed(() => props.message.from_me);

const messageIcon = computed(() => {
    if (props.message.type === "sms") {
        return props.themeMode ? "sms-dark-icon" : "sms-light-icon";
    }
    if (!props.message.from_me) {
        return props.themeMode ? "receive-dark-icon" : "receive-light-icon";
    }
    if (props.message.internal) {
        return props.themeMode ? "internal-dark-blue-icon" : "internal-light-blue-icon";
    }
    return props.themeMode ? "external-dark-blue-icon" : "external-light-blue-icon";
});

const isAudioMessage = computed(() => isAudio(props.message));

const isFileLoading = computed(
    () =>
        props.message.whatsapp_id === "waiting to create" &&
        props.message.type !== "text" &&
        props.message.content &&
        !props.message.content.url
);

const leftAvatarUrl = computed(() => {
    if (props.currentChat?.group) return props.message?.content?.sender?.photo;
    return props.currentChat?.contact?.photo;
});

const audioAvatar = computed(() => {
    if (props.message.from_me && !props.message.sent_by) return props.botAvatarUrl;
    if (props.message.sent_by) return props.message.sent_by.photo;
    if (props.currentChat?.group) return props.message?.content?.sender?.photo;
    return props.currentChat?.contact?.photo;
});

const showHeader = computed(() => {
    if (!shouldDisplayAvatar(props.message, props.nextMessage)) return false;
    if (!props.message.content?.sender) return false;
    if (props.attendant) {
        return (
            !isOwner.value ||
            (props.message.sent_by && props.message.sent_by.id !== props.attendant.id)
        );
    }
    return !isOwner.value || !!props.message.sent_by;
});

const headerClass = computed(() => {
    if (props.attendant) {
        return props.message.sent_by && props.message.sent_by.id !== props.attendant.id
            ? "message-received-name"
            : "message-owner-name";
    }
    return props.message.sent_by?.id ? "message-received-name" : "message-owner-name";
});

const headerText = computed(() => {
    if (props.attendant) {
        return props.message.sent_by && props.message.sent_by.id !== props.attendant.id
            ? props.message.sent_by.name
            : props.message.content?.sender?.name;
    }
    return props.message.sent_by?.id
        ? props.message.sent_by.name
        : props.message.content?.sender?.name;
});

const isMessageSelected = computed(() => {
    if (!props.forwardMode) return false;
    if (Array.isArray(props.message.items) && props.message.items.length > 0) {
        const itemIds = props.message.items
            .map((it) => it?.id)
            .filter((id) => id !== undefined && id !== null && id !== "");
        return (
            itemIds.length > 0 &&
            itemIds.some((id) => props.forwardMode.selectedMessages?.includes(id))
        );
    }
    return props.forwardMode.selectedMessages?.includes(props.message.id) ?? false;
});

const canForwardMessage = computed(() => {
    const msg = props.message;
    const st = String(msg?.stage || msg?.status || "").toLowerCase();
    if (st === "excluded" || st === "exclused") return false;
    if (st === "processing" || st === "failed") return false;
    if (msg.internal) return false;
    const blockedTypes = ["call", "ciphertext", "template", "list", "button", "location"];
    return !blockedTypes.includes(msg?.type);
});

const showDropdownArrow = computed(() => {
    const msg = props.message;
    const allowedTypes = ["file", "image", "audio", "text", "sms", "button", "document", "template", "video"];
    return (
        msg.stage !== "excluded" &&
        allowedTypes.includes(msg.type) &&
        (msg.whatsapp_id !== "waiting to create" || msg.fail_reason || msg.stage === "processing")
    );
});

// ── Methods ──
function handleCurrentTime(currentTime) {
    props.message.content.currentTime = currentTime;
}

function startTouch() {
    touchTimer = setTimeout(() => {
        showPopper.value = true;
        open.value = !open.value;
    }, 550);
}

function endTouch() {
    clearTimeout(touchTimer);
}

function handleContextMenu(event) {
    emit("contextMenu", event, props.message);
}

function handleArrowClick(event) {
    open.value = !open.value;
    emit("contextMenu", event, props.message);
}
</script>

<style scoped>
.internal-dark-blue-icon {
    color: #20388a;
}
.internal-light-blue-icon {
    color: #94c3ff;
}
.external-dark-blue-icon {
    color: #076d96;
}
.external-light-blue-icon {
    color: #b9e7ff;
}
.receive-dark-icon {
    color: #1e2d31;
}
.receive-light-icon {
    color: #ffffff;
}
.sms-dark-icon {
    color: #6b21a8;
}
.sms-light-icon {
    color: #d8b4fe;
}
</style>

<style>
.reflex {
    transform: scaleX(-1);
}

.highlight {
    @apply animate-pulse bg-gray-700 dark:bg-white;
}
</style>
