# Guide de Débogage - Erreurs et Solutions

## 📋 Table des Matières

1. [Erreurs Base de Données](#erreurs-base-de-données)
2. [Erreurs Spring Security](#erreurs-spring-security)
3. [Erreurs JWT](#erreurs-jwt)
4. [Erreurs Lombok](#erreurs-lombok)

---

## 🔧 Erreurs Base de Données

### 1. Problème d'Authentification PostgreSQL

**Problème** : `FATAL: authentification par mot de passe échouée pour l'utilisateur "talentscope_user"`

**Causes** :

- Mot de passe incorrect dans `application.properties`
- Utilisateur PostgreSQL non créé
- Mauvais nom d'utilisateur

**Solutions** :

```sql
-- Créer l'utilisateur
CREATE USER talentscope_user WITH PASSWORD 'secret';

-- Réinitialiser le mot de passe
ALTER ROLE talentscope_user WITH PASSWORD 'secret';
```

**Vérification** :

```properties
# application.properties
spring.datasource.username=talentscope_user
spring.datasource.password=secret
```

---

### 2. Problème de Permissions PostgreSQL

**Problème** : `FATAL: le rôle "talentscope_user" n'est pas autorisé à se connecter`

**Causes** :

- L'utilisateur n'a pas les droits de connexion
- L'utilisateur n'est pas propriétaire de la base
- Privilèges manquants sur le schéma public

**Solutions** :

```sql
-- Rendre l'utilisateur propriétaire
ALTER DATABASE talentscope_db OWNER TO talentscope_user;

-- Donner les droits de connexion
GRANT CONNECT ON DATABASE talentscope_db TO talentscope_user;

-- Donner tous les privilèges sur le schéma
GRANT ALL PRIVILEGES ON SCHEMA public TO talentscope_user;
```

---

### 3. Contrainte de Vérification des Rôles

**Problème** : `ERROR: la nouvelle ligne de la relation « users » viole la contrainte de vérification "users_role_check"`

**Causes** :

- Hibernate génère une contrainte CHECK basée sur l'Enum Java
- Insertion manuelle avec une valeur qui ne correspond pas à l'Enum
- Conflit entre format attendu (index vs nom)

**Solutions** :

```sql
-- Supprimer la contrainte (solution rapide)
ALTER TABLE users DROP CONSTRAINT users_role_check;

-- OU insérer avec la bonne valeur
INSERT INTO users (id, email, password, role) VALUES
('uuid', 'email', 'hash', 0);  -- 0 = premier élément de l'Enum
```

**Prévention** :

```java
// Utiliser les valeurs exactes de l'Enum
public enum Role {
    SUPER_ADMIN,  // Index 0
    RH,          // Index 1
    ENCADRANT,   // Index 2
    STAGIAIRE    // Index 3
}
```

---

## 🛡️ Erreurs Spring Security

### 1. 403 Forbidden sur Login

**Problème** : `403 Forbidden` sur `POST /api/auth/login`

**Causes** :

- Configuration Security incorrecte
- JWT filter bloque les endpoints d'auth
- AuthenticationProvider non configuré
- CSRF non désactivé

**Solutions** :

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .anyRequest().authenticated()
        )
        .authenticationProvider(authenticationProvider())
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
}
```

**Configuration JWT Filter** :

```java
@Override
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) {
    String path = request.getServletPath();

    // Skip auth endpoints
    if (path.startsWith("/api/auth")) {
        filterChain.doFilter(request, response);
        return;
    }

    // JWT validation pour autres endpoints...
}
```

---

### 2. InternalAuthenticationServiceException

**Problème** : `InternalAuthenticationServiceException` pendant le login

**Causes** :

- Utilisateur non trouvé en base
- Enum Role ne correspond pas aux données
- Problème de mapping Hibernate
- Password encoder incompatible

**Solutions** :

```java
// Vérifier l'enum Role
public enum Role {
    SUPER_ADMIN,
    ADMIN,  // Ajouter si nécessaire
    RH,
    ENCADRANT,
    STAGIAIRE
}

// Configurer AuthenticationProvider
@Bean
public DaoAuthenticationProvider authenticationProvider() {
    DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
    authProvider.setUserDetailsService(userDetailsService);
    authProvider.setPasswordEncoder(passwordEncoder());
    return authProvider;
}
```

**Diagnostic** :

```java
@Override
public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

    // Logs pour diagnostic
    System.out.println("User found: " + user.getEmail() + ", Role: " + user.getRole());

    return new org.springframework.security.core.userdetails.User(
            user.getEmail(),
            user.getPassword(),
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
    );
}
```

---

## 🔑 Erreurs JWT

### 1. Clé JWT Trop Courte

**Problème** : `WeakKeyException: The specified key byte array is 64 bits which is not secure enough`

**Causes** :

- Clé JWT < 256 bits (minimum requis)
- Clé trop simple/prédictible

**Solutions** :

```properties
# Clé sécurisée (256+ bits)
jwt.secret=maCleSecreteSuperLongueEtComplexe256bitsMinimum!
jwt.expiration=86400000  # 24 heures
```

**Génération de clé sécurisée** :

```bash
# Générer une clé aléatoire
openssl rand -base64 32
```

---

### 2. Token Expiré

**Problème** : `ExpiredJwtException` ou token invalide

**Causes** :

- Token expiré
- Mauvais format de token
- Clé de validation différente

**Solutions** :

```properties
# Augmenter la durée
jwt.expiration=604800000  # 7 jours

# OU rafraîchir le token
POST /api/auth/refresh
{
  "token": "ancien_token"
}
```

---

## 📦 Erreurs Lombok

### 1. @Builder Ignore les Valeurs par Défaut

**Problème** : L'ID reste null malgré `UUID.randomUUID()`

**Causes** :

- `@Builder` ignore les initialisations directes
- Valeur par défaut non préservée

**Solutions** :

```java
@Entity
public class User {
    @Id
    @GeneratedValue
    @Builder.Default  // Important!
    private UUID id = UUID.randomUUID();

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;
}
```

---

## 🚀 Checklist de Débogage

### Avant de lancer l'application :

1. **Base de données** :
   - [ ] PostgreSQL démarré
   - [ ] Utilisateur créé avec bons droits
   - [ ] Base de données accessible

2. **Configuration** :
   - [ ] `application.properties` correct
   - [ ] Clé JWT sécurisée (256+ bits)
   - [ ] Enum Role cohérent

3. **Code** :
   - [ ] SecurityConfig correct
   - [ ] JWT filter skip `/api/auth`
   - [ ] AuthenticationProvider configuré

### Pendant le débogage :

1. **Logs utiles** :

   ```properties
   logging.level.org.springframework.security=DEBUG
   logging.level.org.hibernate.SQL=DEBUG
   ```

2. **Tests étape par étape** :
   - [ ] Démarrage de l'application
   - [ ] Connexion à la base
   - [ ] Création des tables
   - [ ] Insertion utilisateur test
   - [ ] Login sans JWT
   - [ ] Génération JWT
   - [ ] Accès endpoint protégé

---

## 📞 Support

**Si vous rencontrez une erreur non documentée** :

1. **Capturer les logs complets**
2. **Vérifier la checklist ci-dessus**
3. **Isoler le problème (base, security, JWT)**
4. **Tester avec des valeurs simples**

**Commandes utiles** :

```bash
# Vérifier les processus PostgreSQL
ps aux | grep postgres

# Tester la connexion DB
psql -h localhost -U talentscope_user -d talentscope_db

# Vider et recréer les tables
DELETE FROM users;
```
