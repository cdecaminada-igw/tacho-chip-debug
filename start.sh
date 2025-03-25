#!/bin/bash

# Avvia il server statico
/opt/homebrew/bin/serve -s /Users/Cristian/Sviluppo/InfogestWeb/serial-guy/dist &

# Attendi qualche secondo per far partire il server
sleep 1

# Apri Brave con la pagina locale
open -a "Brave Browser" http://localhost:3000