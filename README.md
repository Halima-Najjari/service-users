# Talentscope - Service Utilisateurs

## Description
Ce microservice gère l'authentification, les rôles et la gestion des comptes pour la plateforme Talentscope (gestion et évaluation des stagiaires avec IA).

## Stack technique
- Java 17
- Spring Boot
- Spring Security (JWT)
- PostgreSQL

## Lancer en local
1. Installer Java 17 et Maven.
2. Configurer `application.properties` avec vos infos PostgreSQL.
3. Lancer : `mvn spring-boot:run`.

## Endpoints principaux
- `POST /auth/login` — Connexion.
- `POST /auth/register` — Inscription.
- `GET /users/me` — Profil de l’utilisateur connecté.

## Auteur
Talentscope Dev Team
