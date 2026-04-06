# Guide d'utilisation des Mock Data

## 📋 Description

Le système de mock data permet de tester complètement l'application **sans avoir besoin du serveur backend**. Toutes les requêtes HTTP sont interceptées et retournent des données fictives réalistes.

## 🚀 Comment activer le mode Mock

### Option 1 : Via l'URL (Recommandé pour le développement)

Ajoutez le paramètre `?mock=true` à l'URL de votre application :

```
http://localhost:4200/?mock=true
```

Ensuite, rechargez la page pour que le paramètre prenne effet.

### Option 2 : Via la configuration en code

Modifiez le fichier `src/app/environment.development.ts` :

```typescript
export const environment = {
    production: false,
    baseUrl: 'http://localhost:8080',
    apiUrl: 'http://localhost:8080/api/v1',
    
    // Activer le mock data
    enableMock: true,
    
    appName: 'KikEvent',
    version: '1.0.0'
};
```

Puis mettez à jour `src/app/core/services/mock-http.interceptor.ts` :

```typescript
export class MockInterceptorConfig {
  static enabled = environment.enableMock; // Ou true directement
  // ...
}
```

### Option 3 : Via la console du navigateur

Ouvrez la console (F12) et tapez :

```javascript
// Enable mock mode
localStorage.setItem('mockEnabled', 'true');
location.reload();
```

## 📊 Données Mock disponibles

### 1. **Dashboard Stats** (`/admin/stats`)
- Statistiques complètes du tableau de bord
- Graphiques mensuels revenus
- Activités récentes
- Répartition des utilisateurs par rôle

### 2. **Utilisateurs** (`/admin/users`)
- Liste de 5 utilisateurs de test
- Recherche par email/username
- Pagination fonctionnelle
- Actions : supprendre, activer, réinitialiser MDP

### 3. **Événements** (`/admin/events`)
- 5 événements avec différents statuts
- Recherche et filtrage par statut
- Actions de validation/refus
- Tickets vendus et capacité

### 4. **Billets/Tickets** (`/admin/billets`)
- 5 billets avec différents statuts
- Pagination
- Action de remboursement

### 5. **Paiements** (`/admin/payments`)
- 5 paiements avec différents statuts
- Montants, commissions, références
- Pagination

### 6. **Demandes d'onboarding** (`/admin/onboarding`)
- 3 demandes avec différents statuts
- Documents attachés
- Actions : approuver/rejeter

### 7. **Notifications** (`/admin/notifications`)
- 3 notifications d'exemple
- Création de nouvelles notifications
- Pagination

## 🧪 Tester les fonctionnalités

### Test de connexion (Login)

1. Naviguez à `/login`
2. Entrez n'importe quel email/password
3. L'intercepteur acceptera la connexion et retournera les données mock

**Credentials de test :**
- Email : `test@example.com` (n'importe quel email)
- Mot de passe : `test123` (n'importe quel mot de passe)

### Test du dashboard

1. Après connexion, allez au dashboard
2. Vous verrez :
   - 245 utilisateurs total
   - 35 organisateurs
   - 210 participants
   - 12 événements actifs
   - 4250 billets vendus
   - 187.5M de revenus total

### Test de pagination

1. Allez à n'importe quelle liste (Utilisateurs, Événements, etc.)
2. Testez le changement de page
3. Changez le nombre d'éléments par page

### Test de filtrage

1. **Utilisateurs** : Recherchez par email ou nom d'utilisateur
2. **Événements** : Filtrez par statut (PENDING, VALIDATED, REFUSED)
3. **Billets** : Filtrez par statut (VALIDE, UTILISE, REMBOURSE, ANNULE)
4. **Paiements** : Filtrez par statut (SUCCES, ECHEC, EN_ATTENTE)

### Test d'actions

Essayez les actions suivantes (les données sont modifiées en mémoire) :

- ✅ Valider/Refuser un événement
- ✅ Suspendre/Activer un utilisateur
- ✅ Rembourser un billet
- ✅ Approuver/Rejeter une demande d'onboarding
- ✅ Envoyer une notification

## ⚙️ Configuration du délai réseau

Par défaut, un délai de **800ms** est simulé pour chaque requête (pour imiter la latence réseau).

Pour modifier ce délai, changez la valeur dans `mock-http.interceptor.ts` :

```typescript
export class MockInterceptorConfig {
  static simulateDelay = 800; // Augmentez ou diminuez cette valeur
}
```

## 📂 Structure des fichiers Mock

```
src/app/core/
├── data/
│   └── mock-data.ts          ← Toutes les données mock
└── services/
    └── mock-http.interceptor.ts  ← Intercepteur HTTP
```

## 🔄 Désactiver le mode Mock

- **Option 1 (URL)** : Supprimez `?mock=true` de l'URL
- **Option 2 (Code)** : Changez `enableMock: false` dans environment
- **Option 3 (Console)** : `localStorage.removeItem('mockEnabled'); location.reload();`

## 💡 Tips & Tricks

### Ajouter plus de données mock

1. Modifiez `src/app/core/data/mock-data.ts`
2. Ajoutez vos données dans les arrays
3. Elles seront automatiquement disponibles via l'intercepteur

### Modifier les endpoints mockés

Pour ajouter un nouvel endpoint mokké :

```typescript
if (req.url.includes('/nouveau-endpoint') && req.method === 'GET') {
  return of(
    new HttpResponse({
      status: 200,
      body: wrapResponse(vos_donnees)
    })
  ).pipe(delay(MockInterceptorConfig.simulateDelay));
}
```

### Simuler des erreurs

Activez la simulation d'erreurs :

```typescript
export class MockInterceptorConfig {
  static simulateErrors = true; // Génère des erreurs aléatoires
}
```

## 🐛 Dépannage

### Les données mock ne s'affichent pas

1. Vérifiez que `?mock=true` est dans l'URL
2. Ouvrez la console (F12) et cherchez `[MOCK API]` dans les logs
3. Assurez-vous que MockInterceptorConfig.enabled = true

### Les données mock s'affichent mais les actions ne fonctionnent pas

Les modifications sont mises en mémoire et perdues au rechargement. C'est normal !

### Comment persister les changements ?

Pour persister les données, modifiez le mock interceptor pour utiliser localStorage :

```typescript
if (req.url.includes('/admin/users/') && req.url.includes('/suspend')) {
  // Modifiez localStorage au lieu des données en mémoire
}
```

## 📝 Exemple d'utilisation complète

```bash
# 1. Démarrez le serveur de développement
npm start

# 2. Ouvrez dans le navigateur
# http://localhost:4200/?mock=true

# 3. Connectez-vous avec n'importe quel identifiant

# 4. Explorez tous les modules
# - Dashboard : voir les stats
# - Utilisateurs : tester la recherche et les actions
# - Événements : tester la validation/refus
# - Billets : tester les remboursements
# - Paiements : voir les stats de paiement
# - Onboarding : approuver/rejeter des demandes
# - Notifications : envoyer des notifs
```

## 🎯 Prochaines étapes

Quand vous êtes prêt à utiliser le vrai backend :

1. Retirez le paramètre `?mock=true` de l'URL
2. Assurez-vous que le serveur backend est en cours d'exécution sur `http://localhost:8080`
3. L'application compilera les appels API au serveur réel

---

**Note** : Le système de mock data est parfait pour le développement, les tests et les démos, mais **ne remplace pas les tests d'intégration** avec le vrai backend avant la production.
