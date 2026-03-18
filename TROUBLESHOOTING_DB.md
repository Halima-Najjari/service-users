# Guide de Configuration et Débogage Base de Données

## 1. Problème d'Authentification (Base de données)

**Symptôme** : Maven affichait un BUILD FAILURE et Spring Boot s'arrêtait avec l'erreur : `FATAL: authentification par mot de passe échouée pour l'utilisateur "talentscope_user"`.

**Cause** : Le mot de passe configuré dans le fichier `application.properties` ne correspondait pas à celui défini dans pgAdmin, ou l'utilisateur n'existait pas encore avec les bons droits.

**Solution** :

- Création de l'utilisateur `talentscope_user` dans pgAdmin.
- Réinitialisation forcée du mot de passe via SQL :

```sql
ALTER ROLE talentscope_user WITH PASSWORD 'secret';
```

## 2. Problème de Permissions (Accès distant/local)

**Symptôme** : Même avec le bon mot de passe, l'erreur persistait : `FATAL: le rôle "talentscope_user" n'est pas autorisé à se connecter`.

**Cause** : Par défaut, PostgreSQL restreint l'accès aux nouvelles bases de données. L'utilisateur n'avait pas le droit de "Connexion" ni le droit d'utiliser le schéma public.

**Solution** :

- Définition de l'utilisateur comme propriétaire (Owner) de la base :

```sql
ALTER DATABASE talentscope_db OWNER TO talentscope_user;
```

- Attribution des privilèges de connexion et de modification :

```sql
GRANT CONNECT ON DATABASE talentscope_db TO talentscope_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO talentscope_user;
```

## 3. Warning Lombok dans le code Java (@Builder)

**Symptôme** : Windsurf affichait un avertissement indiquant que l'ID resterait toujours null.

**Cause** : L'utilisation de l'annotation `@Builder` de Lombok ignore les initialisations directes dans la classe (comme `id = UUID.randomUUID()`).

**Solution** : Ajout de l'annotation `@Builder.Default` au-dessus du champ `id` dans l'entité `User.java` pour forcer Lombok à utiliser la valeur par défaut lors de la création d'un objet.

## 4. Erreur de Contrainte SQL (users_role_check)

**Symptôme** : Lors de l'insertion manuelle d'un utilisateur en SQL, l'erreur suivante apparaissait : `viole la contrainte de vérification "users_role_check"`.

**Cause** : Hibernate génère automatiquement une contrainte (Check Constraint) basée sur ton Enum Java. Si tu essaies d'insérer 'ADMIN' alors que Hibernate attend 'ROLE_ADMIN' ou un index numérique (0, 1), la base rejette l'insertion.

**Solution** : Ajuster la requête SQL pour correspondre au format attendu par Hibernate (souvent l'index 0 pour le premier élément de l'Enum).

## État Actuel du Projet

- **Serveur** : L'application Spring Boot démarre avec succès (`Started TalentscopeApplication`).
- **Base de données** : La connexion est établie (`HikariPool-1 - Start completed`).
- **ORM (Hibernate)** : Les tables (comme `users`) sont créées automatiquement dans pgAdmin.

## 5.Correction de la Contrainte de Base de Données

**Symptôme** : PostgreSQL affichait l'erreur `ERROR: la nouvelle ligne de la relation « users » viole la contrainte de vérification "users_role_check"`.

**Explication** : Dans ton code Java, tu utilises un Enum pour les rôles. Lors de la création automatique des tables, Hibernate génère une contrainte SQL (CHECK) qui n'accepte que les valeurs exactes définies dans l'Enum.

**Conflit** : Si Hibernate attend par exemple 0 (index) ou ROLE_ADMIN (avec préfixe), et que toi tu écris ADMIN manuellement, PostgreSQL bloque l'opération par sécurité.

**Solution** : La contrainte de vérification `users_role_check` a été supprimée de la table `users` dans pgAdmin. Cela a résolu l'erreur lors des insertions manuelles.

```sql
ALTER TABLE users DROP CONSTRAINT users_role_check;
```
