import { createFileRoute } from "@tanstack/react-router";
import { CreateLinkPage } from "../features/links/create-link-page";

export const Route = createFileRoute("/")({ component: CreateLinkPage });
