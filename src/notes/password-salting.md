---
title: Password Salting
tags:
  - cybersecurity
created: 2025-05-06
updated: 2025-05-06
---

When you “salt” a password, it means you add random data to a password before hashing it.

How it works:

1. A unique random salt is generated for each user.
2. The salt is combined with the password (e.g., `"password123" + "random_salt"`).
3. The result is hashed.
4. The salt and the hash are stored in the database.

This way, even if two users choose `"password123"`, their hashes will be different.
