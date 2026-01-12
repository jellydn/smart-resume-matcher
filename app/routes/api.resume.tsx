import { eq } from "drizzle-orm";
import { db } from "~/db";
import { userResumes } from "~/db/schema";
import { auth } from "~/lib/auth.server";
import { generateId, resumeSchema } from "~/lib/types";
import type { Route } from "./+types/api.resume";

export async function loader({ request }: Route.LoaderArgs) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user?.id) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const result = await db.query.userResumes.findFirst({
			where: eq(userResumes.userId, session.user.id),
			orderBy: (resumes, { desc }) => [desc(resumes.updatedAt)],
		});

		if (!result) {
			return Response.json({ resume: null, updatedAt: null });
		}

		const validationResult = resumeSchema.safeParse(result.resumeData);
		if (!validationResult.success) {
			console.error("Invalid resume data in database:", validationResult.error);
			return Response.json({ resume: null, updatedAt: null });
		}

		return Response.json({
			resume: validationResult.data,
			updatedAt: result.updatedAt?.toISOString() ?? null,
		});
	} catch (error) {
		console.error("Error loading resume from database:", error);
		return Response.json({ error: "Failed to load resume" }, { status: 500 });
	}
}

export async function action({ request }: Route.ActionArgs) {
	if (request.method !== "POST") {
		return Response.json({ error: "Method not allowed" }, { status: 405 });
	}

	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user?.id) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const validationResult = resumeSchema.safeParse(body.resume);

		if (!validationResult.success) {
			return Response.json(
				{
					error: "Invalid resume data",
					details: validationResult.error.issues,
				},
				{ status: 400 },
			);
		}

		const existingResume = await db.query.userResumes.findFirst({
			where: eq(userResumes.userId, session.user.id),
		});

		const now = new Date();

		if (existingResume) {
			await db
				.update(userResumes)
				.set({
					resumeData: validationResult.data,
					updatedAt: now,
				})
				.where(eq(userResumes.id, existingResume.id));
		} else {
			await db.insert(userResumes).values({
				id: generateId(),
				userId: session.user.id,
				resumeData: validationResult.data,
				createdAt: now,
				updatedAt: now,
			});
		}

		return Response.json({
			success: true,
			updatedAt: now.toISOString(),
		});
	} catch (error) {
		console.error("Error saving resume to database:", error);
		return Response.json({ error: "Failed to save resume" }, { status: 500 });
	}
}
