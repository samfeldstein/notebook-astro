---
title: How to Write Better Spaced Repetition Cards
created: 2026-09-25
updated: 2026-09-25
tags: [spaced-repetition, augmented-learning, Anki]
---

## Card-writing is a core skill

Spaced repetition cards are not merely containers for information. They are the fundamental building blocks of the mnemonic medium, so the quality of the cards directly affects the quality of the learning system.

Card-writing is therefore an open-ended skill. Improving it expands what spaced repetition can accomplish. Like sentences in prose, cards can be written casually or developed with considerable precision.

Writing good cards requires thinking carefully about two things:

* **How knowledge should be represented**
* **How learning and memory actually work**

A better understanding of these leads to better card design.

## Make cards atomic

Most questions and answers should be **atomic**: each card should test one relatively small, clearly defined piece of knowledge.

A card that asks for several pieces of information at once can be difficult. If it is repeatedly forgotten, the problem may not be the learner's memory but the structure of the card.

For example, a technical command might initially be represented as one card asking for an entire command and its arguments. If that card is consistently forgotten, break it into smaller questions that isolate the individual components:

1. What is the basic command and option?
2. What is the required ordering of the arguments?

The resulting cards make it much clearer what is actually being forgotten. Each component can then be practiced independently, making retrieval more reliable.

### Atomicity improves diagnosis

Atomic cards aren't merely easier to memorize. They provide better information about **where the learner's knowledge is weak**.

A compound card can produce an ambiguous failure: perhaps one part was forgotten, perhaps another, or perhaps the combination itself is causing difficulty. Splitting the card into atomic components makes the source of the problem more visible.

This turns card-writing into a form of learning-system design: the card should expose the specific piece of knowledge that needs strengthening.

## Atomic does not mean disconnected

Breaking information into atomic cards does not mean that the larger idea should disappear.

After decomposing a difficult compound card, the original integrated card can sometimes be useful as well. The atomic cards establish and reinforce the individual pieces, while the larger card tests whether those pieces can be brought together into a coherent whole.

A useful pattern is therefore:

**decompose → learn the pieces → integrate the whole**

Atomic cards help build reliable retrieval of individual facts or relationships; integrative cards can subsequently test understanding of how those pieces fit together.

### Cards that rephrase questions may help

Multiple cards that phrase the same question in different ways may help build a wider gateway to the answer than the narrow one a single card or phrasing provides.

Re above example, in addition to the cards that break `ln -s linkname filename` into multiple cards, write a card that asks: *Write the terminal command to create a soft link from `file1` to `file2`.*

## Avoid orphan cards

A card is an "orphan" when it doesn't connect to anything you already know. The goal is a densely interconnected web of Q&As, not isolated facts.

## Self-made cards are usually better

People tend to get more out of cards they write themselves than ones written by someone else — likely because making the card is itself an act of understanding, not just packaging information. Using others' cards forfeits that benefit.

## Further reading

* [How can we develop transformative tools for thought?](https://numinous.productions/ttft/)
* [How to write good spaced repetition prompts](https://andymatuschak.org/prompts/)
* [Important attributes of good spaced repetition memory prompts](https://notes.andymatuschak.org/z9xavmmNq7xvNqzpnJ3HFXx)
