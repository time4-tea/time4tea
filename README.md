# Support the project 🙏 with a one off tip

https://ko-fi.com/time4tea 

# NORD VPN Required at this time

have a nordVPN account with a service account - visit https://my.nordaccount.com/dashboard/nordvpn/manual-configuration/ to create a service account 

https://ref.nordvpn.com/SHbmTxmwVbT

# Install 

download bin/time4tea

`./time4tea` and follow instructions

then once the script if finally running and you should be able to access:

[transmission](http://localhost:9091)
[sonarr](http://localhost:8989)
[radarr](http://localhost:7878)
[jackett](http://localhost:7119)

# setup

add the transmission download client to radarr and sonarr

set the hostname to: `http://transmission-vpn` 
leave the port as: `9091`


#### radarr

http://localhost:7878/settings/downloadclients

#### sonarr

http://localhost:8989/settings/downloadclients


#### jackett
now create a indexer for sonarr and radarr with your desired choice 
