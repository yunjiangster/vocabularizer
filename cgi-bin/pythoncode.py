#!/usr/bin/env python
import BaseHTTPServer
import CGIHTTPServer
import cgi, cgitb
cgitb.enable()
form = cgi.FieldStorage()
param = form.getvalue("param","error")
print param
