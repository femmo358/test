#!/bin/sh
echo Updating...
sudo apt update -y
sudo apt upgrade -y

echo XMRig Building...
sudo apt install git build-essential cmake libuv1-dev libssl-dev libhwloc-dev figlet -y
figlet -f small Cloning repository
git clone https://github.com/xmrig/xmrig
mkdir xmrig/build
cd xmrig/build
figlet -f small Compiling xmrig
cmake ..
make -j$(nproc)
figlet -f small Done compiling
sudo apt remove figlet -y
cd ./xmrig/build
echo XMRig build successfully !

echo Config HUBPAGE...
sudo sysctl -w vm.nr_hugepages=1024
for i in $(find /sys/devices/system/node/node* -maxdepth 0 -type d);
do
    echo 3 > "$i/hugepages/hugepages-1048576kB/nr_hugepages";
done
echo "1GB pages successfully !"
