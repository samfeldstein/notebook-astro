---
title: Subnet Range
aliases:
  - Subnet Range
tags:
  - networking
  - computing
created: 2025-06-24
updated: 2025-06-24
---

A subnet's range is determined by its network address and [[netmasks|subnet mask]]. The range starts with the lowest address (all host bits set to 0) and ends with the highest address (all host bits set to 1). The highest address is the [[broadcast-address|broadcast address]].

## Example

Your [CIDR](https://foldoc.org/cidr) is `10.200.20.0/24`.  The `24` means the first 24 bits of the netmask comprise the network address. That leaves 8 bits leftover for the host portion. (IPv4 addresses have 32 bits. 32 - 24 = 8.)

The netmask looks like this:

`255.255.255.0`

Or, in binary:

`11111111.11111111.11111111.00000000`

We can figure out how may hosts the netmask supports by calculating the number of combinations we can make out of 8 bits. We do that using [[exponentiation|exponentiation]].