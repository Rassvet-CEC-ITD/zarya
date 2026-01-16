package de.fhdo.zarya.api.persistance.models;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "categorical_cell")
@IdClass(CategoricalCell.CategoricalCellId.class)
public class CategoricalCell {

    @ManyToOne
    private Organ organ;

    @ElementCollection
    private List<String> category;

    @ElementCollection
    private List<String> allowedCategory;

    @Id
    @Column(name = "x_index", nullable = false)
    private int xIndex;

    @Id
    @Column(name = "y_index", nullable = false)
    private int yIndex;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoricalCellId implements Serializable {
        private int xIndex;
        private int yIndex;
    }
}
