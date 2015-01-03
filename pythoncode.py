#!/usr/bin/env python
import cgi
form = cgi.FieldStorage()
param = form.getvalue("param","error")
print param
