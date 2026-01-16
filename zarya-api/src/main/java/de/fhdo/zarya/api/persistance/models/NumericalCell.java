package de.fhdo.zarya.api.persistance.models;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "numerical_cell")
@IdClass(NumericalCell.NumericalCellId.class)
public class NumericalCell {

    @ManyToOne
    private Organ organ;

    @ElementCollection
    private List<Double> value;

    @Id
    @Column(name = "x_index", nullable = false)
    private int xIndex;

    @Id
    @Column(name = "y_index", nullable = false)
    private int yIndex;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NumericalCellId implements Serializable {
        private int xIndex;
        private int yIndex;
    }
}