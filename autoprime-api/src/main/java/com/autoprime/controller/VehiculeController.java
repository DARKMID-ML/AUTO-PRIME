package com.autoprime.controller;

import com.autoprime.dto.VehiculeDTO;
import com.autoprime.service.VehiculeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** API vehicules. Toutes les réponses sont des DTOs (JSON en français).
 *
 * GET    /api/vehicules          → catalogue (filtre optionnel ?service=Vente)
 * GET    /api/vehicules/{id}     → un véhicule
 * POST   /api/vehicules          → créer (compte connecté)
 * PUT    /api/vehicules/{id}     → mettre à jour (compte connecté)
 * DELETE /api/vehicules/{id}     → supprimer (compte connecté)
 */
@RestController
@RequestMapping("/api/vehicules")
public class VehiculeController {

    private final VehiculeService service;

    public VehiculeController(VehiculeService service) {
        this.service = service;
    }

    @GetMapping
    public List<VehiculeDTO> getAll(
            @RequestParam(value = "service", required = false) String filtreService) {
        if (filtreService != null && !filtreService.isBlank()) {
            return service.getByService(filtreService);
        }
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehiculeDTO> getById(@PathVariable Long id) {
        VehiculeDTO vehicule = service.getById(id);
        return vehicule == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(vehicule);
    }

    @PostMapping
    public VehiculeDTO create(@Valid @RequestBody VehiculeDTO dto) {
        dto.setId(null);
        return service.save(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehiculeDTO> update(@PathVariable Long id,
                                              @Valid @RequestBody VehiculeDTO dto) {
        if (service.getById(id) == null) {
            return ResponseEntity.notFound().build();
        }
        dto.setId(id);
        return ResponseEntity.ok(service.save(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (service.getById(id) == null) {
            return ResponseEntity.notFound().build();
        }
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
