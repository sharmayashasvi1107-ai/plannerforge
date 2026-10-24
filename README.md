# PlannerForge

PlannerForge is a web app for building your own digital planner. You work through a short series of steps, such as uploading your content and choosing a template, and the app puts the planner together for you.

Built with Next.js, React and Tailwind CSS, and deployed on Vercel.

## Live demo

**Try it here:https://plannerforge-4f31592gq-sage-2dea.vercel.app/ **

No installation is needed. Open the link in any modern browser.

## Project structure

```
app/                 Next.js app router (pages and global styles)
components/shell/    App shell, such as the header
components/steps/    The step-by-step flow (upload, template, and so on)
components/ui/       Shared UI pieces, such as the hero section
```

## About the redesign (upcoming update)

The version on `main` is the stable, submitted build. It is the one deployed on Vercel.

A visual redesign of PlannerForge is also in progress. It is **not part of the submitted build**. It is being developed separately on a `redesign` branch so that it cannot affect the working app.

Planned changes in the redesign:

- **New colour palette** and refreshed global styling.
- **PlannerForge logo**, used in the header and on the planner's back cover.
- **Revolving card ring** on the landing screen, where moodboard cards rotate in a single ring. This replaces an earlier globe experiment.
- **Notebook-style planner interface**, with pages you flip through and the PlannerForge logo printed on the back cover.
- **Slide navigation** between steps.
- **Sample moodboard images** shipped with the app for demos.

None of this is final. The redesign will be merged into `main` only after it has been tested.

## Roadmap

- Finish and merge the redesign.
- Polish the notebook page-turn animation and the card ring.
- Add more templates.
- Add export options for finished planners.

## Author

Built by Yashasvi Sharma.