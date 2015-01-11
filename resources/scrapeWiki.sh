for i in {0..9} ; do 
    start=$(( i * 10000  + 1 )) 
    end=$(( start + 9999 )) 
    url="http://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/PG/2005/08/$start-$end"
    echo $url
    wget $url
    python extractFreq.py $start-$end >> out
    rm $start-$end
done
