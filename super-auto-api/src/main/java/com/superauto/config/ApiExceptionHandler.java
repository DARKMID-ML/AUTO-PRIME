package com.superauto.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.Map;
import java.util.stream.Collectors;

/**
 * Transforme les exceptions en réponses JSON lisibles (en français).
 *
 * Objectif : une donnée manquante ou invalide renvoie une 400 avec un
 * message clair (« La marque est obligatoire ») au lieu d'une 500 muette.
 * Aucun détail technique n'est renvoyé au navigateur.
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    /** Corps JSON : {"erreur": "message"} */
    private ResponseEntity<Map<String, String>> erreur(HttpStatus statut, String message) {
        return ResponseEntity.status(statut).body(Map.of("erreur", message));
    }

    /** Champs manquants ou invalides dans un corps de requête. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> validation(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .distinct()
                .collect(Collectors.joining(" "));
        if (message.isBlank()) {
            message = "Données invalides.";
        }
        return erreur(HttpStatus.BAD_REQUEST, message);
    }

    /** JSON illisible (champ mal nommé, guillemets manquants…). */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> corpsInvalide(HttpMessageNotReadableException exception) {
        return erreur(HttpStatus.BAD_REQUEST, "Requête invalide : vérifiez les champs envoyés.");
    }

    /** Type d'identifiant incorrect (ex. /api/vehicules/abc). */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, String>> identifiantInvalide(MethodArgumentTypeMismatchException exception) {
        return erreur(HttpStatus.BAD_REQUEST, "Identifiant invalide.");
    }

    /** Contrainte base de données (champ obligatoire manquant, doublon…). */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> contrainte(DataIntegrityViolationException exception) {
        log.warn("Contrainte base de données : {}", exception.getMostSpecificCause().getMessage());
        return erreur(HttpStatus.BAD_REQUEST, "Données invalides : certains champs obligatoires sont manquants.");
    }

    /** Toute autre erreur : message générique, trace uniquement dans les logs. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> inattendue(Exception exception) {
        log.error("Erreur inattendue", exception);
        return erreur(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur interne du serveur.");
    }
}
