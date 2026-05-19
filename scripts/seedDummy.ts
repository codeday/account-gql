import { config as loadEnv } from "dotenv";
import fs from "fs";
import path from "path";

loadEnv();

const fixture = {
    event: {
        id: "event-test-2025",
        name: "Local Test Event 2025",
        metadata: {
            location: "Local",
            timezone: "UTC",
            source: "seed-dummy",
        },
    },
    mentors: [
        { id: "mentor-alice", role: "mentor", givenName: "Alice", familyName: "Nguyen" },
        { id: "mentor-bob", role: "mentor", givenName: "Bob", familyName: "Rivera" },
    ],
    students: [
        { id: "student-ava", role: "student", givenName: "Ava", familyName: "Patel" },
        { id: "student-ben", role: "student", givenName: "Ben", familyName: "Kim" },
    ],
    project: {
        id: "project-local-1",
        name: "Neighborhood Climate Dashboard",
        mentors: ["mentor-alice", "mentor-bob"],
        students: ["student-ava", "student-ben"],
    },
};

const outputPath = path.resolve(process.cwd(), "scripts", ".seed-dummy.json");
fs.writeFileSync(outputPath, JSON.stringify(fixture, null, 2));

console.log(`Wrote local seed fixture: ${outputPath}`);
console.log("This service is Auth0-backed and has no Prisma event/project models, so seed data is generated as local fixtures for testing workflows.");
