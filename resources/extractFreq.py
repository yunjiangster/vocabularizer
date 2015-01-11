import sys,re,math
start= False
with open(sys.argv[1]) as f:
    ret = ''.join([t.strip('\r\t\n ') for t in f.readlines()])
mode = 'wiki'
# wikipedia
if mode == 'wiki':
    for w1, w2 in re.findall('<a href="[^"]*"[^>]* title="([^"]*)"[^>]*>([^<]*)',ret):
        if w1.startswith(w2) and not ' ' in w2 and (not ' ' in w1 or w1.endswith('(page does not exist)')):
            print w2
    
# wordfrequency.info
if mode == 'wordfreq': 
    for r,w,p,f in re.findall('<tr><td>([0-9]*)</td><td>([^<]*)</td><td>([a-z])</td><td>([0-9]*)</td><td width="3" bgcolor="#999999">&nbsp;</td>',ret):
        print '\t'.join([r,w,p,f])
    

