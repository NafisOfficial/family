"use client";

import { FormField } from "@/components/forms/FormField";
import { useAuth } from "@/context/AuthContext";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import {
  createStorySchema,
  type CreateStoryInput,
} from "@/lib/validations/story";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

export function StoryCreateForm() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showSuccess, showError, showLoading, hideLoading } = useSweetAlert();
  const [isSaving, setIsSaving] = useState(false);
  const [createdTitle, setCreatedTitle] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateStoryInput>({
    resolver: zodResolver(createStorySchema),
    defaultValues: {
      title: "",
      content: "",
      mediaUrls: [],
      visibility: "public",
    },
  });

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) {
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          continue;
        }
        formData.append("files", file);
      }

      const response = await fetch("/api/images/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Unable to upload image.");
      }

      setImageUrls((current) => [...current, ...result.data]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      await showError(
        "Upload failed",
        error instanceof Error ? error.message : "Unable to upload image.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (url: string) => {
    setImageUrls((current) => current.filter((item) => item !== url));
  };

  const onSubmit = async (data: CreateStoryInput) => {
    if (!user) {
      await showError(
        "Sign in required",
        "Please sign in before posting a story.",
      );
      return;
    }

    setIsSaving(true);
    await showLoading("Posting your story...");

    try {
      const payload = {
        ...data,
        mediaUrls: imageUrls,
      };

      const response = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to publish story");
      }

      setCreatedTitle(result.data.title);
      reset();
      setImageUrls([]);
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      await showSuccess(
        "Story published",
        "Your family can now read your memory.",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to publish story.";
      await showError("Publish failed", message);
    } finally {
      hideLoading();
      setIsSaving(false);
    }
  };

  return (
    <form
      id="story-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            New family story
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">
            Share a memory or update with your relatives.
          </h2>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Posting..." : "Post story"}
        </button>
      </div>

      <FormField
        label="Title"
        htmlFor="title"
        error={errors.title?.message?.toString()}
      >
        <input
          id="title"
          type="text"
          {...register("title")}
          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          placeholder="A special moment from today"
        />
      </FormField>

      <FormField
        label="Story"
        htmlFor="content"
        error={errors.content?.message?.toString()}
      >
        <textarea
          id="content"
          rows={6}
          {...register("content")}
          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          placeholder="Tell your family what happened..."
        />
      </FormField>

      <FormField label="Attach images" htmlFor="imageFile">
        <input
          id="imageFile"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => uploadFiles(event.target.files)}
          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition file:cursor-pointer file:rounded-full file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
        {isUploading ? (
          <p className="mt-2 text-sm text-slate-500">Uploading images…</p>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            Upload one or more photos to attach them to your story.
          </p>
        )}
      </FormField>

      {imageUrls.length > 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-slate-900">
              Attached images
            </p>
            <p className="text-xs text-slate-500">Preview before posting</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {imageUrls.map((url) => (
              <div
                key={url}
                className="group relative overflow-hidden rounded-3xl bg-white"
              >
                <img
                  src={url}
                  alt="Attached image"
                  className="h-40 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute right-3 top-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <FormField label="Visibility" htmlFor="visibility">
        <select
          id="visibility"
          {...register("visibility")}
          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="public">Public</option>
          <option value="relatives">Relatives only</option>
        </select>
      </FormField>

      {createdTitle ? (
        <div className="rounded-3xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Your story “{createdTitle}” was successfully posted.
        </div>
      ) : null}
    </form>
  );
}
