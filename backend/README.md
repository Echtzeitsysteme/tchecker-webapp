# Timed Automata Analysis Backend 

Backend for the timed automata analysis project, which provides a REST API to analyze timed automata models based on the TChecker model checker.

## Running the project in Docker

To run the project in Docker, follow these steps:
1. Build the Docker image:
   ```bash
   docker build -t timed-automata-backend .
   ```
2. Run the Docker container:
   ```bash
   docker run -d -p 8000:8000 timed-automata-backend
   ```  

## Development

### Prerequisites
Create a virtual environment and install the required dependencies:

```bash
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt 

```
You will also need to build the TChecker shared library. Follow the instructions in the [TChecker documentation](https://github.com/ticktac-project/tchecker/wiki/Installation-of-TChecker) to build the library and set the `LIBTCHECKER_ENABLE_SHARED` OPTION to `ON` during the CMake configuration step. 
Copy TChecker shared library binary to the project root directory:
```bash
cp /path/to/tchecker/installation ./libtchecker.so

```


### Running the server
To run the server, use the following command:
```bash
fastapi dev main.py

``` 

### Running tests
To run the tests, use the following command:
```bash
pytest tests/

```
