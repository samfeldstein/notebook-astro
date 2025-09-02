---
title: Positional Notation
aliases:
  - Positional Notation
  - Positional Number Systems
tags:
  - computing
  - math
created: 2025-06-24
updated: 2025-06-24
---

In **positional notation**, the value of a number depends on the actual values of its digits and their positions.

So in the number 25, the actual value of the 2 is 20, and the actual value of the 5 is 5. $20 + 5 = 25$.

## Break it down

A digit's **actual value** equals its individual value times its unit value:

$$a = du$$

The unit value is the [[base-mathematics|base]] to the power of the digit's position:

$$b^p$$

**We count positions from the smallest unit, and positions start at 0.** In the number 25, we start at the ones place (5). So the five's position is 0, and the two's position is 1.

Another way to put it is that the value of a digit ($d$) is a function of its individual value, position ($p$) in the number, and the [[base-mathematics|base]] ($b$):

$$d \times b^p$$

Example. 25 is a decimal (base 10), so we can calculate its value like so:

$$
(2 \times 10^1) + (5 \times 10^0) = 20 + 5 = 25
$$
