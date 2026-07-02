import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// ---------------------------------------------------------------------------
// POST /api/quiz-answers
// Body: { pageSlug, componentId, question, selectedOption }
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { pageSlug, componentId, question, selectedOption } =
    (body as Record<string, unknown>) ?? {};

  if (!pageSlug || componentId === undefined || !question || !selectedOption) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: pageSlug, componentId, question, selectedOption.",
      },
      { status: 400 }
    );
  }

  await pool.query(
    `INSERT INTO quiz_answers (page_slug, component_id, question, selected_option)
     VALUES ($1, $2, $3, $4)`,
    [pageSlug, componentId, question, selectedOption]
  );

  return NextResponse.json({ ok: true }, { status: 201 });
}

// ---------------------------------------------------------------------------
// GET /api/quiz-answers?pageSlug=<slug>
// Returns grouped answer counts for a page.
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pageSlug = searchParams.get("pageSlug");

  if (!pageSlug) {
    return NextResponse.json(
      { error: "Missing required query param: pageSlug." },
      { status: 400 }
    );
  }

  const result = await pool.query<{
    component_id: number;
    question: string;
    selected_option: string;
    count: string;
  }>(
    `SELECT component_id, question, selected_option, COUNT(*) AS count
     FROM quiz_answers
     WHERE page_slug = $1
     GROUP BY component_id, question, selected_option
     ORDER BY component_id, count DESC`,
    [pageSlug]
  );

  const data = result.rows.map((row) => ({
    componentId: row.component_id,
    question: row.question,
    option: row.selected_option,
    count: Number(row.count),
  }));

  return NextResponse.json(data);
}
