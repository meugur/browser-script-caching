FROM python:3

RUN pip install flask

WORKDIR usr/src/

COPY server.py .
COPY templates/ templates/
COPY js/ js/

ENV FLASK_APP=server.py
ENV FLASK_ENV=development

EXPOSE 5000

CMD python -m flask run
