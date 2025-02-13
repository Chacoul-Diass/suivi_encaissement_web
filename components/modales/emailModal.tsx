"use client";

import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useEffect } from "react";
import IconMail from "../icon/icon-mail";
import ReactQuill from "react-quill";
import { TRootState } from "@/store";
import { useSelector } from "react-redux";

interface EmailModalProps {
  emailModalOpen: any;
  ccEmails: any;
  emailConnecte: any;
  removeToEmail: any;
  emailInput: any;
  setEmailInput: any;
  emailSubject: any;
  setEmailSubject: any;
  params: any;
  handleMultipleFileUpload: any;
  uploadedFiles: any;
  removeFile: any;
  setEmailModalOpen: any;
  handleSendEmail: any;
  setParams: any;
  handleToKeyDown: any;
  setToInput: any;
  removeCcEmail: any;
  handleCcKeyDown: any;
  toEmails: any;
  toInput: any;
  numeroBordereau?: string;
}

export default function EmailModal({
  emailModalOpen,
  ccEmails,
  emailConnecte,
  removeToEmail,
  emailInput,
  setEmailInput,
  emailSubject,
  setEmailSubject,
  params,
  handleMultipleFileUpload,
  uploadedFiles,
  removeFile,
  setEmailModalOpen,
  handleSendEmail,
  setParams,
  handleToKeyDown,
  setToInput,
  removeCcEmail,
  handleCcKeyDown,
  toEmails,
  toInput,
  numeroBordereau,
}: EmailModalProps) {
  const user = useSelector((state: TRootState) => state.auth?.user);
  const { email = "" } = user || {};

  return (
    <Transition appear show={emailModalOpen} as={Fragment}>
      <Dialog
        as="div"
        open={emailModalOpen}
        className={"fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"}
        onClose={() => setEmailModalOpen(false)}
      >
        <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
          <div className="flex min-h-screen items-start justify-center px-4">
            <Dialog.Panel className="panel my-8 w-full max-w-4xl transform overflow-hidden rounded-xl border-0 bg-white p-0 shadow-2xl transition-all">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <IconMail className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Notifier le Banquier</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(false)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                {/* Emails "To" */}
                <div className="mb-5">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    À (Emails principaux)
                  </label>
                  <div className="form-input flex min-h-[42px] w-full flex-wrap items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                    {toEmails.map(({ mail }: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-sm font-medium text-primary"
                      >
                        <span>{mail}</span>
                        <button
                          type="button"
                          className="ml-1 rounded-full p-0.5 hover:bg-primary/20"
                          onClick={() => removeToEmail(index)}
                        >
                          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <input
                      type="text"
                      value={toInput}
                      onChange={(e) => setToInput(e.target.value)}
                      onKeyDown={handleToKeyDown}
                      placeholder="Ajouter un email"
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* CC Emails */}
                <div className="mb-5">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    CC (Emails supplémentaires)
                  </label>
                  <div className="form-input flex min-h-[42px] w-full flex-wrap items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                    {ccEmails.map((emailObj: { mail: string }, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-sm font-medium text-gray-700"
                      >
                        <span>{emailObj.mail}</span>
                        {emailObj.mail !== emailConnecte && (
                          <button
                            type="button"
                            className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeCcEmail(index);
                            }}
                          >
                            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <input
                      type="text"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={handleCcKeyDown}
                      placeholder="Ajouter un email"
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Objet */}
                <div className="mb-5">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Objet
                  </label>
                  <input
                    type="text"
                    value={emailSubject || `Retard sur le bordereau N°${numeroBordereau || ''}`}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Retard sur le bordereau N°..."
                    className="form-input w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>

                {/* Contenu du message */}
                <div className="mb-5">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Message
                  </label>
                  <div className="rounded-lg border border-gray-300 shadow-sm">
                    <ReactQuill
                      theme="snow"
                      value={params.description || ""}
                      defaultValue={params.description || ""}
                      onChange={(content, delta, source, editor) => {
                        setParams({
                          description: content,
                          displayDescription: editor.getText(),
                        });
                      }}
                      className="min-h-[200px]"
                    />
                  </div>
                </div>

                {/* Upload multiple files */}
                <div className="mb-5">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Pièces jointes
                  </label>
                  <div className="rounded-lg border-2 border-dashed border-gray-300 p-4">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleMultipleFileUpload(e)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.25 13.25a.75.75 0 001.5 0V4.636l2.955 3.129a.75.75 0 001.09-1.03l-4.25-4.5a.75.75 0 00-1.09 0l-4.25 4.5a.75.75 0 101.09 1.03L9.25 4.636v8.614z" />
                        <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                      </svg>
                      Choisir des fichiers
                    </label>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                      {uploadedFiles.map(({ file, preview }: any, index: number) => (
                        <div
                          key={index}
                          className="group relative overflow-hidden rounded-lg border bg-white p-2 shadow-sm"
                        >
                          <button
                            type="button"
                            className="absolute right-1 top-1 z-10 rounded-full bg-white/90 p-1 text-gray-400 opacity-0 shadow-sm transition-opacity hover:text-red-500 group-hover:opacity-100"
                            onClick={() => removeFile(index)}
                          >
                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                          </button>
                          <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-gray-100">
                            {file?.type.startsWith("image/") ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={preview}
                                alt="Aperçu"
                                className="h-full w-full object-cover"
                              />
                            ) : file?.type === "application/pdf" ? (
                              <div className="flex h-full items-center justify-center bg-red-50 p-4">
                                <svg className="h-8 w-8 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M7 3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V7.4c0-.5-.2-1-.5-1.4l-3.5-3.5c-.4-.3-.9-.5-1.4-.5H7zm5 16c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" />
                                </svg>
                              </div>
                            ) : (
                              <div className="flex h-full items-center justify-center bg-gray-50 p-4">
                                <svg className="h-8 w-8 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M3 5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="mt-2">
                            <p className="truncate text-xs text-gray-500" title={file?.name}>
                              {file?.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSendEmail}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Envoyer
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
