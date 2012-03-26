cat tests/samples/external.txt \
    | awk 'BEGIN {num = 0}; $0 != "" {print "curl "$0" -o tests/samples/external/"num".htm"; num=num+1}' \
    | sh
