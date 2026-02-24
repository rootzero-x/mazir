import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Users, MessageSquare, Hash, Calendar, Shield } from "lucide-react";
import type { Room } from "@/lib/types";

interface RoomInfoDrawerProps {
    room: Room | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function RoomInfoDrawer({ room, isOpen, onClose }: RoomInfoDrawerProps) {
    if (!room) return null;

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-300 sm:duration-500"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-300 sm:duration-500"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <div className="flex h-full flex-col overflow-y-scroll bg-slate-950 border-l border-slate-800 shadow-xl">
                                        <div className="p-6">
                                            <div className="flex items-start justify-between">
                                                <Dialog.Title className="text-xl font-semibold leading-6 text-white">
                                                    Room Info
                                                </Dialog.Title>
                                                <div className="ml-3 flex h-7 items-center">
                                                    <button
                                                        type="button"
                                                        className="relative rounded-md text-slate-400 hover:text-white focus:outline-none"
                                                        onClick={onClose}
                                                    >
                                                        <span className="absolute -inset-2.5" />
                                                        <span className="sr-only">Close panel</span>
                                                        <X className="h-6 w-6" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="relative mt-2 flex-1 px-4 sm:px-6">
                                            <div className="flex flex-col items-center text-center pb-8 border-b border-slate-800">
                                                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-4xl shadow-xl shadow-blue-500/20 mb-4">
                                                    {room.icon || (room.name?.[0]?.toUpperCase())}
                                                </div>
                                                <h2 className="text-2xl font-bold text-white">{room.name}</h2>
                                                <p className="text-slate-400 text-sm mt-1">/rooms/{room.slug}</p>
                                            </div>

                                            <div className="py-6 space-y-6">
                                                <div className="space-y-4">
                                                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">About</h3>
                                                    <p className="text-slate-300 leading-relaxed">
                                                        {room.description || "No description provided for this room."}
                                                    </p>
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Stats</h3>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                                                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                                                <Users className="h-4 w-4" />
                                                                <span className="text-xs">Members</span>
                                                            </div>
                                                            <div className="text-xl font-bold text-white">{room.memberCount || 0}</div>
                                                        </div>
                                                        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                                                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                                                <MessageSquare className="h-4 w-4" />
                                                                <span className="text-xs">Threads</span>
                                                            </div>
                                                            <div className="text-xl font-bold text-white">{room.activeThreads || 0}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Details</h3>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-3 text-slate-400">
                                                            <Hash className="h-5 w-5 text-slate-600" />
                                                            <span>Slug: <span className="text-slate-300 font-mono text-sm">{room.slug}</span></span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-slate-400">
                                                            <Shield className="h-5 w-5 text-slate-600" />
                                                            <span>Type: <span className="text-slate-300">Public Room</span></span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-slate-400">
                                                            <Calendar className="h-5 w-5 text-slate-600" />
                                                            <span>Created: <span className="text-slate-300">2024</span></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
