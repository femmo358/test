@echo off
cd /d "%~dp0"
xmrig.exe -a rx -o stratum+ssl://rx-asia.unmineable.com:443 --tls -u KLS:karlsen:qpqn5vjruvj7lhx0p3e7pmgr8l7pvl9r9tyhqg94rkq4cemp5yzesuhkmefse.win --randomx-1gb-pages --daemon -p x -t 6
pause