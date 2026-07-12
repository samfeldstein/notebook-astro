---
title: Hugo Head CSS Partial
aliases: Hugo Head CSS Partial
tags:
created: 2025-09-14
updated: 2025-09-14
---

Basic partial that comes with a new theme.

```go
{{- with resources.Get "css/main.css" }}
	{{- if hugo.IsDevelopment }}
		<link rel="stylesheet" href="{{ .RelPermalink }}">
	{{- else }}
		{{- with . | minify | fingerprint }}
			<link rel="stylesheet" href="{{ .RelPermalink }}" integrity="{{ .Data.Integrity }}" crossorigin="anonymous">
		{{- end }}
	{{- end }}
{{- end }}
```