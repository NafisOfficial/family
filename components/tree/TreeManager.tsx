"use client";

import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/button";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import {
  inferInverseRelationship,
  resolveRelationshipLabel,
} from "@/lib/helpers/relationships";
import {
  addRelationshipSchema,
  type AddRelationshipInput,
} from "@/lib/validations/tree";
import { RelationshipType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus, RotateCcw } from "lucide-react";
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { useForm } from "react-hook-form";

interface TreeMemberData {
  _id: string;
  displayName: string;
  avatarUrl?: string;
  gender: "male" | "female" | "other" | "prefer_not_to_say";
  bio?: string;
  dateOfBirth?: string | null;
  dateOfDeath?: string | null;
  isAlive: boolean;
}

interface TreeRelationshipData {
  _id: string;
  fromMember: string;
  toMember: string;
  relationshipType: RelationshipType;
  isConfirmed: boolean;
}

interface TreeManagerProps {
  members: TreeMemberData[];
  relationships: TreeRelationshipData[];
}

const relationshipOptions: RelationshipType[] = [
  "father",
  "mother",
  "son",
  "daughter",
  "spouse",
  "brother",
  "sister",
  "grandfather",
  "grandmother",
  "grandson",
  "granddaughter",
  "uncle",
  "aunt",
  "nephew",
  "niece",
  "cousin",
];

const relationshipLayer: Record<RelationshipType, number> = {
  grandfather: 0,
  grandmother: 0,
  father: 1,
  mother: 1,
  uncle: 1,
  aunt: 1,
  spouse: 1,
  brother: 2,
  sister: 2,
  cousin: 2,
  son: 3,
  daughter: 3,
  nephew: 3,
  niece: 3,
  grandson: 4,
  granddaughter: 4,
};

const layerTitles: Record<number, string> = {
  0: "Grandparents",
  1: "Parents, Uncles & Aunts",
  2: "Siblings & Cousins",
  3: "Children, Nephews & Nieces",
  4: "Grandchildren",
};

type RelCategory =
  | "grandparent"
  | "parent"
  | "sibling"
  | "spouse"
  | "child"
  | "grandchild";

const relationshipCategory: Record<RelationshipType, RelCategory> = {
  grandfather: "grandparent",
  grandmother: "grandparent",
  father: "parent",
  mother: "parent",
  uncle: "parent",
  aunt: "parent",
  spouse: "spouse",
  brother: "sibling",
  sister: "sibling",
  cousin: "sibling",
  son: "child",
  daughter: "child",
  nephew: "child",
  niece: "child",
  grandson: "grandchild",
  granddaughter: "grandchild",
};

const categoryColors: Record<RelCategory, string> = {
  grandparent: "#8b5cf6",
  parent: "#f59e0b",
  sibling: "#0ea5e9",
  spouse: "#ec4899",
  child: "#10b981",
  grandchild: "#6366f1",
};

function getRelationshipColor(type: RelationshipType) {
  return categoryColors[relationshipCategory[type]] ?? "#64748b";
}

interface TreeNodeData {
  key: string;
  member: TreeMemberData;
  relationshipType: RelationshipType;
}

interface LinePoint {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 1.8;

export function TreeManager({
  members: initialMembers,
  relationships: initialRelationships,
}: TreeManagerProps) {
  const [members, setMembers] = useState<TreeMemberData[]>(initialMembers);
  const [relationships, setRelationships] =
    useState<TreeRelationshipData[]>(initialRelationships);
  const [rootMemberId, setRootMemberId] = useState<string>(
    initialMembers[0]?._id ?? "",
  );
  const { showSuccess, showError } = useSweetAlert();

  const membersById = useMemo(
    () => new Map(members.map((member) => [member._id, member])),
    [members],
  );

  const rows = useMemo(() => {
    const layers = new Map<number, TreeNodeData[]>();

    relationships.forEach((relationship) => {
      const isOutgoing = relationship.fromMember === rootMemberId;
      const isIncoming = relationship.toMember === rootMemberId;
      if (!isOutgoing && !isIncoming) {
        return;
      }

      const otherMemberId = isOutgoing
        ? relationship.toMember
        : relationship.fromMember;
      const otherMember = membersById.get(otherMemberId);
      if (!otherMember) {
        return;
      }

      const relationshipType = isOutgoing
        ? inferInverseRelationship(
            relationship.relationshipType,
            otherMember.gender,
          )
        : relationship.relationshipType;

      const level = relationshipLayer[relationshipType];
      const items = layers.get(level) ?? [];
      items.push({
        key: `${otherMember._id}-${relationshipType}`,
        member: otherMember,
        relationshipType,
      });
      layers.set(level, items);
    });

    return [0, 1, 2, 3, 4].map((level) => ({
      level,
      title: layerTitles[level],
      items: layers.get(level) ?? [],
    }));
  }, [membersById, relationships, rootMemberId]);

  const rootMember = membersById.get(rootMemberId);
  const hasConnections = rows.some((row) => row.items.length > 0);

  // --- existing add-relationship logic (unused in this view, left intact) ---
  const {
    register: registerRelationship,
    handleSubmit: handleSubmitRelationship,
    reset: resetRelationship,
    formState: {
      errors: relationshipErrors,
      isSubmitting: isCreatingRelationship,
    },
  } = useForm<AddRelationshipInput>({
    resolver: zodResolver(addRelationshipSchema),
    defaultValues: {
      fromMemberId: members[0]?._id ?? "",
      toMemberId: members[1]?._id ?? "",
      relationshipType: "cousin",
    },
  });

  const addRelationship = async (data: AddRelationshipInput) => {
    try {
      const response = await fetch("/api/tree/relationships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to create relationship");
      }

      setRelationships((current) => [
        ...current,
        result.data.relationship,
        result.data.inverseRelationship,
      ]);
      resetRelationship();
      await showSuccess(
        "Relationship created",
        "The new family relationship was added.",
      );
    } catch (error) {
      await showError(
        "Unable to add relationship",
        error instanceof Error ? error.message : "Something went wrong.",
      );
    }
  };

  // --- pan & zoom canvas ---
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const dragState = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    dragging: boolean;
  } | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [lines, setLines] = useState<LinePoint[]>([]);

  const setNodeRef = useCallback(
    (key: string) => (el: HTMLDivElement | null) => {
      if (el) nodeRefs.current.set(key, el);
      else nodeRefs.current.delete(key);
    },
    [],
  );

  const measureLines = useCallback(() => {
    const stage = stageRef.current;
    const rootEl = nodeRefs.current.get("root");
    if (!stage || !rootEl) {
      setLines([]);
      return;
    }

    const getOffset = (el: HTMLElement) => {
      let x = 0;
      let y = 0;
      let node: HTMLElement | null = el;
      while (node && node !== stage) {
        x += node.offsetLeft;
        y += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      return { x, y };
    };

    const rootOffset = getOffset(rootEl);
    const rootCenter = {
      x: rootOffset.x + rootEl.offsetWidth / 2,
      y: rootOffset.y + rootEl.offsetHeight / 2,
    };

    const nextLines: LinePoint[] = [];
    rows.forEach((row) => {
      row.items.forEach((item) => {
        const el = nodeRefs.current.get(item.key);
        if (!el) return;
        const offset = getOffset(el);
        const center = {
          x: offset.x + el.offsetWidth / 2,
          y: offset.y + el.offsetHeight / 2,
        };
        nextLines.push({
          key: item.key,
          x1: rootCenter.x,
          y1: rootCenter.y,
          x2: center.x,
          y2: center.y,
          color: getRelationshipColor(item.relationshipType),
        });
      });
    });
    setLines(nextLines);
  }, [rows]);

  useLayoutEffect(() => {
    measureLines();
    const handle = () => measureLines();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, [measureLines, rootMemberId]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      origX: view.x,
      origY: view.y,
      dragging: false,
    };
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = dragState.current;
    if (!state) return;
    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    if (!state.dragging && Math.hypot(dx, dy) > 4) state.dragging = true;
    if (state.dragging) {
      setView((current) => ({
        ...current,
        x: state.origX + dx,
        y: state.origY + dy,
      }));
    }
  };

  const handlePointerUp = () => {
    dragState.current = null;
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    setView((current) => {
      const next = current.scale - event.deltaY * 0.0015;
      return { ...current, scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, next)) };
    });
  };

  const zoomBy = (delta: number) => {
    setView((current) => ({
      ...current,
      scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, current.scale + delta)),
    }));
  };

  const resetView = () => setView({ x: 0, y: 0, scale: 1 });

  const renderAvatar = (name: string, color: string, size: number) => (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ backgroundColor: color, width: size, height: size, fontSize: size * 0.4 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );

  const renderNode = (
    nodeKey: string,
    name: string,
    label: string,
    color: string,
    isRoot = false,
    onSelect?: () => void,
  ) => (
    <div
      ref={setNodeRef(nodeKey)}
      key={nodeKey}
      onClick={onSelect}
      className={`flex flex-col items-center gap-2 rounded-2xl border bg-white px-3 py-3 shadow-sm transition hover:shadow-md ${
        isRoot ? "border-emerald-400 ring-2 ring-emerald-100" : "border-slate-200"
      } ${onSelect ? "cursor-pointer" : ""}`}
      style={{ width: isRoot ? 108 : 92 }}
    >
      {renderAvatar(name, color, isRoot ? 56 : 48)}
      <p
        className={`text-center text-xs font-semibold leading-tight ${
          isRoot ? "text-emerald-700" : "text-slate-900"
        }`}
      >
        {name}
      </p>
      <span
        className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white"
        style={{ backgroundColor: color }}
      >
        {label}
      </span>
    </div>
  );

  const renderRow = (row: (typeof rows)[number]) =>
    row.items.length > 0 ? (
      <div key={row.level} className="flex flex-wrap justify-center gap-6">
        {row.items.map((node) =>
          renderNode(
            node.key,
            node.member.displayName,
            resolveRelationshipLabel(node.relationshipType),
            getRelationshipColor(node.relationshipType),
            false,
            () => setRootMemberId(node.member._id),
          ),
        )}
      </div>
    ) : null;

  return (
    <div className="space-y-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Family tree
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              Your family tree
            </h1>
            <p className="mt-2 text-slate-600">
              Add members and connect their relationships to build the story of
              your family.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 px-5 py-4">
              <p className="text-sm text-slate-500">Members</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {members.length}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 px-5 py-4">
              <p className="text-sm text-slate-500">Relationships</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {relationships.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Family graph
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">
              Explore your family tree
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Drag to pan, scroll to zoom, or click any person to re-center the
              tree on them.
              {rootMember?.bio ? ` · ${rootMember.bio}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={rootMemberId}
              onChange={(event) => setRootMemberId(event.target.value)}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              {members.map((member) => (
                <option value={member._id} key={member._id}>
                  {member.displayName}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => zoomBy(-0.15)}
                className="rounded-full p-2 text-slate-600 hover:bg-white"
                aria-label="Zoom out"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={resetView}
                className="rounded-full p-2 text-slate-600 hover:bg-white"
                aria-label="Reset view"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => zoomBy(0.15)}
                className="rounded-full p-2 text-slate-600 hover:bg-white"
                aria-label="Zoom in"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onWheel={handleWheel}
          className="relative mt-6 h-[560px] w-full touch-none select-none overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_60%)] active:cursor-grabbing"
          style={{ cursor: "grab" }}
        >
          {!rootMember ? (
            <p className="flex h-full items-center justify-center px-4 text-center text-slate-500">
              Select a member to view the tree.
            </p>
          ) : (
            <div
              className="absolute left-1/2 top-1/2"
              style={{
                transform: `translate(-50%, -50%) translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
                transformOrigin: "center",
              }}
            >
              <div
                ref={stageRef}
                className="relative flex flex-col items-center gap-14 px-10 py-6"
              >
                <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
                  {lines.map((line) => (
                    <line
                      key={line.key}
                      x1={line.x1}
                      y1={line.y1}
                      x2={line.x2}
                      y2={line.y2}
                      stroke={line.color}
                      strokeWidth={2}
                      strokeOpacity={0.55}
                    />
                  ))}
                </svg>

                {!hasConnections ? (
                  <div className="flex flex-col items-center gap-3 px-6 py-10">
                    {renderNode("root", rootMember.displayName, "You", "#10b981", true)}
                    <p className="text-sm text-slate-500">
                      No family member connected yet.
                    </p>
                  </div>
                ) : (
                  <>
                    {renderRow(rows[0])}
                    {renderRow(rows[1])}

                    <div className="flex flex-wrap items-center justify-center gap-6">
                      {rows[2].items.map((node) =>
                        renderNode(
                          node.key,
                          node.member.displayName,
                          resolveRelationshipLabel(node.relationshipType),
                          getRelationshipColor(node.relationshipType),
                          false,
                          () => setRootMemberId(node.member._id),
                        ),
                      )}
                      {renderNode("root", rootMember.displayName, "You", "#10b981", true)}
                    </div>

                    {renderRow(rows[3])}
                    {renderRow(rows[4])}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
          {Object.entries(categoryColors).map(([category, color]) => (
            <div key={category} className="flex items-center gap-2 text-xs text-slate-500">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="capitalize">{category}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}