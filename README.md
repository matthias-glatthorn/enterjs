# Interaktive Visualisierung von Umfrageergebnissen

Diese Angular-Anwendung bildet die Ergebnisse einer Umfrage, welche die Bewertung der Wichtigkeit von IT-Trends in unterschiedlichen Berufsgruppen mithilfe eines Fragebogens erfasst, als interaktive Datenvisualisierung ab. Die Anwendung zeigt exemplarisch, wie Angular und D3.js zur Erstellung von interaktiven Datenvisualisierungen kombiniert werden können. Dabei werden mit der programmatischen Erzeugung und der deklarativen Erzeugung von visuellen Elementen die beiden wichtigsten Herangehensweisen bei Umsetzung von Datenvisualisierungen vorgestellt.

![Screenshot application](docs/assets/img/ItTrendsVisualisation_01.jpg)

## Kommunikationspfade und Verteilungsbeziehungen im System

Ein API-Proxy leitet Anfragen an die DragnSurvey API weiter, verhindert dass viele Anfragen in kurzer Zeit zu einer Überschreitung des Rate-Limits der DragnSurvey API führen und speichert die Daten, welche von der DragnSurvey API empfangen wurden. Auf dem Backend-Server werden außerdem Daten aus unterschiedlichen API-Endpunkten aggregiert und vorstrukturiert.
![Deployment diagram](docs/assets/img/DeploymentDiagram.svg)

## Lokaler Entwicklungsserver

Führen Sie `npm run start` aus, um einen lokalen Entwicklungsserver zu starten. Sie erreichen die Anwendung unter der Adresse `http://localhost:4200/`. Die Anwendung wird automatisch neu geladen, wenn sich eine der Quelldateien ändert.

## Bereitstellen von Software-Artefakten

Führen Sie `npm run build` aus um die Software-Artefakte dieses Projekts zu erstellen. Die Artefakte werden im Verzeichnis `dist/` gespeichert.

## Ausführen der Software-Tests

Führen Sie `npm run test` aus, um die Software-Tests mit [Jest](https://jestjs.io/) auszuführen.

