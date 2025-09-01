FROM python:3.12 AS python_boost


# Install system dependencies and cmake/make to build tchecker
# Install tchecker dependencies bison, boost, flex, doxygen, catch2
RUN apt-get update && apt-get install -y \
    git \
    build-essential \
    cmake \
    bison \
    flex \
    && rm -rf /var/lib/apt/lists/*


# Install necessary boost libraries
WORKDIR /opt/boost
RUN git clone https://github.com/boostorg/boost.git -b boost-1.88.0 boost_1_88_0 --depth 1 && \
    cd boost_1_88_0 && \
    git submodule update --depth 1 -q --init tools/boostdep && \
    git submodule update --depth 1 -q --init libs/json && \
    git submodule update --depth 1 -q --init libs/functional && \
    git submodule update --depth 1 -q --init libs/container_hash && \
    git submodule update --depth 1 -q --init libs/dynamic_bitset && \
    git submodule update --depth 1 -q --init libs/rational && \
    git submodule update --depth 1 -q --init libs/iterator && \
    git submodule update --depth 1 -q --init libs/algorithm && \
    python tools/boostdep/depinst/depinst.py -X test -g "--depth 1" json && \
    python tools/boostdep/depinst/depinst.py -X test -g "--depth 1" functional && \
    python tools/boostdep/depinst/depinst.py -X test -g "--depth 1" container_hash && \
    python tools/boostdep/depinst/depinst.py -X test -g "--depth 1" dynamic_bitset && \
    python tools/boostdep/depinst/depinst.py -X test -g "--depth 1" rational && \
    python tools/boostdep/depinst/depinst.py -X test -g "--depth 1" iterator && \
    python tools/boostdep/depinst/depinst.py -X test -g "--depth 1" algorithm
WORKDIR /opt/boost/boost_1_88_0
# BUild and install boost statically
RUN ./bootstrap.sh && \
    ./b2 cxxflags=-fPIC cflags=-fPIC -j$(nproc) && \
    ./b2 cxxflags=-fPIC cflags=-fPIC install --prefix=/usr/local

# Set environment for dynamic linker
ENV LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH


# Clean up
RUN rm -rf /opt/boost/boost_1_88_0
    
FROM python_boost AS tchecker_builder

WORKDIR /tchecker

# Copy tchecker source code
COPY tchecker/ /tchecker/tchecker-source

RUN cd /tchecker && \
    mkdir build && \
    mkdir install

WORKDIR /tchecker/build

RUN cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/tchecker/install -DLIBTCHECKER_ENABLE_SHARED=ON /tchecker/tchecker-source && \
    make -j$(nproc) && \
    make install

# CMD ["sleep", "infinity"]
    
FROM python_boost

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*


# Install pip dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app source
COPY . .

# Copy tchecker from the builder stage
COPY --from=tchecker_builder /tchecker/install/lib/libtchecker.so ./libtchecker.so

# Expose the FastAPI default port
EXPOSE 8000

# Run FastAPI using the CLI
CMD ["fastapi", "run", "main.py"]