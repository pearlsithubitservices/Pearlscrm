    import { useMemo } from "react";

export default function useProjectFilter(
    projects,
    search,
    active
) {

    return useMemo(() => {

        const q = search?.toLowerCase() || "";

        return projects.filter((project) => {

            const searched =

                project.company
                    ?.toLowerCase()
                    .includes(q)

                ||

                project.companylocation
                    ?.toLowerCase()
                    .includes(q)

                ||

                project.status
                    ?.toLowerCase()
                    .includes(q)

                ||

                project.leader
                    ?.toLowerCase()
                    .includes(q)

                ||

                project.priority
                    ?.toLowerCase()
                    .includes(q)

                ||

                project.title
                    ?.toLowerCase()
                    .includes(q)

                ||

                project.members?.some(
                    (member) =>
                        member
                            ?.toLowerCase()
                            .includes(q)
                );

            const filtered =

                active === "All"

                    ? true

                    : active === "on Track"

                        ? new Date(project.dueDate) > new Date()

                        : new Date(project.dueDate) <= new Date();
            return searched && filtered;

        });

    }, [projects, search, active]);

}