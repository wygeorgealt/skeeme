---
name: Skeeme
description: A warm, annotated study-sheet visual system for a student study companion.
colors:
  brand-blue: "#1688f5"
  action-blue: "#075eaa"
  paper: "#f6f2e8"
  sheet: "#fffdf7"
  ink: "#1a2735"
  muted-ink: "#4b5c6e"
  rule: "#d6d0c4"
  blue-wash: "#e4f1ff"
typography:
  display:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "clamp(3rem, 7.3vw, 5.7rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.04em"
  heading:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "clamp(1.65rem, 3.2vw, 2.4rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "clamp(1.3rem, 2.4vw, 1.75rem)"
    fontWeight: 600
    letterSpacing: "-0.025em"
  brand:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    letterSpacing: "-0.035em"
  legal-page-title:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "clamp(2rem, 5vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.04em"
  legal-intro:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "1.05rem"
    lineHeight: 1.7
  legal-section:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "1.35rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  legal-meta:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "0.88rem"
  body:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  button:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 700
    lineHeight: 1.2
  label:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 700
    letterSpacing: "0.04em"
rounded:
  sheet: "0px"
  menu: "5px"
  button: "6px"
  brand-mark: "11px"
components:
  navigation:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "16px 0"
  button-primary:
    backgroundColor: "{colors.action-blue}"
    textColor: "#ffffff"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "0 20px"
    height: "48px"
  button-paper:
    backgroundColor: "{colors.sheet}"
    textColor: "#153b5c"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "0 20px"
    height: "48px"
  study-sheet:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    padding: "clamp(24px, 4vw, 42px) clamp(22px, 5vw, 56px) 24px"
  example-steps:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.muted-ink}"
    padding: "14px 0 0"
---

# Design System: Skeeme

## Overview

**Creative North Star: "The Annotated Study Guide"**

The public website treats studying as an active, readable process. Warm paper, graphite-like text, a confident serif, and small blue marks make the page feel like a useful study sheet rather than generic app chrome. Its visual system introduces the product through specific study material and a clear next action.

Use this language for the public website; the mobile app may keep its own platform-native patterns. Keep the existing Skeeme name and logo, and let blue signal identity, action, or a selected study step. The surface stays calm and legible, with a single lifted sheet as the focal example.

**Key Characteristics:**
- Warm paper fields with crisp, near-white study sheets.
- Literata display type paired with practical DM Sans.
- Skeeme blue used for identity, actions, and meaningful state.
- Square editorial surfaces, fine rules, and one restrained shadow.

## Colors

The palette pairs one recognizable blue family with warm paper, dark ink, and a cool-tinted study highlight.

### Primary
- **Skeeme Blue:** Brand mark and the active step indicator.
- **Deep Action Blue:** Primary download actions and visible keyboard focus.

### Neutral
- **Study Paper:** The page ground; keeps long-form content warm without reducing contrast.
- **Clean Sheet:** The example surface above the page ground.
- **Graphite Ink:** Headlines and high-priority text.
- **Quiet Ink:** Supporting copy and inactive controls.
- **Rule Gray:** Thin separators that organize content without boxing every section.
- **Blue Wash:** A light annotation surface for labels and revealed answers.

**The Blue Is Functional Rule.** Use blue to identify Skeeme, show an actionable control, or mark a meaningful state; do not add it as arbitrary decoration.

## Typography

**Display Font:** Literata (with Georgia, serif fallback)  
**Body Font:** DM Sans (with Arial, sans-serif fallback)

**Character:** Literata gives the page an editorial study-guide voice; DM Sans keeps controls and explanatory copy direct and easy to scan. Both Latin subsets are self-hosted by the site and use system fallbacks when unavailable.

### Hierarchy
- **Display:** Main page headline; the largest serif scale uses tight tracking and close line spacing.
- **Heading:** Study-sheet and section headings.
- **Title:** Example-stage titles.
- **Body:** Explanations and supporting copy; constrain long passages for comfortable reading.
- **Button:** Download actions use the body family at a strong weight.
- **Label:** Example-stage labels and short annotations use compact, tracked uppercase text.

**The Two Voices Rule.** Use Literata for statements and section hierarchy; use DM Sans for reading, navigation, and action.

## Layout

The page uses a centered content width capped at 1120px, with a wider 1240px masthead. At wide widths, explanatory sections can use two columns and tool summaries can sit in a simple list; at 760px and below, navigation collapses and content stacks. At 480px and below, side gutters tighten to 16px and the tool list becomes a single column. Keep the study example broad and let its three steps become a vertical selector on mobile.

Spacing is deliberately varied: compact labels and controls sit close to their content, while sections use generous vertical separation. Prefer the existing fluid `clamp()` sizing and 24px wide-screen gutters over fixed widths that force horizontal scrolling.

### Legal reading pages

Privacy and terms pages share the paper ground, Skeeme masthead, local Literata and DM Sans fonts, and fine-rule vocabulary. Keep each policy as one readable, flat sheet with a comfortable prose measure; use the documented legal title, introduction, section, and metadata type roles, and reserve blue for the brand, links, focus, and current navigation. Include a keyboard skip link and keep the compact legal navigation available at narrow widths.

## Elevation & Depth

Depth is restrained. The study sheet is the only broad lifted surface, separated from the paper ground by a fine border and a soft, low-contrast shadow. Blue margin marks and tinted surfaces carry state; other sections remain flat.

### Shadow Vocabulary
- **Study sheet:** `0 18px 46px rgb(34 43 53 / 9%), 0 2px 6px rgb(34 43 53 / 5%)`; use only for the focal study example.

**The One Lifted Sheet Rule.** Reserve the broad shadow for the study example; do not turn every content group into a floating card.

## Shapes

The system favors square study surfaces and small, functional corners: the study sheet has no rounding, while buttons, the menu control, and the existing brand mark use gently softened edges. Thin rules and the sheet's blue left margin are more characteristic than heavy borders or pill shapes.

## Components

### Buttons
- **Shape:** Gently softened corners.
- **Primary:** Deep Action Blue with white text and generous horizontal padding.
- **Paper action:** Clean Sheet with dark blue text for the closing call to action.
- **Hover / Focus:** A small lift and deeper blue on hover; a clear 3px outline with 4px offset on keyboard focus.
- **Secondary:** Text links remain underlined or gain an underline on hover rather than becoming another filled button.

### Cards / Containers
- **Study sheet:** Square Clean Sheet with a fine border, a 2px blue margin mark, responsive internal padding, and the single shadow described above.
- **Other sections:** Use page-width grouping and separator rules before adding another card.

### Navigation
- **Desktop:** Skeeme mark and name at left; section links and one filled download action at right.
- **Mobile:** Preserve the brand row and use a 44px menu control; reveal the links in a vertical list and close on Escape or link selection.

### Study-step selector
Three real buttons move the example from note to explanation to active recall. Expose the selected step with `aria-pressed` and the blue indicator; show the answer only in the practice state.

## Do's and Don'ts

### Do:
- **Do** keep the Skeeme name and existing logo in the public website masthead and footer.
- **Do** use the documented blue family for the brand, the primary action, and meaningful selected states.
- **Do** let real study content demonstrate how the product helps, and label illustrative examples clearly.
- **Do** preserve visible keyboard focus, reduced-motion support, and the responsive single-column layout.

### Don't:
- **Don't** introduce unsupported academic outcomes, testimonials, or exam-specific claims.
- **Don't** imply an iOS download destination until one is confirmed.
- **Don't** replace the study material with generic feature-card grids or decorative device chrome.
- **Don't** spread the study-sheet shadow or blue accents across unrelated content.
