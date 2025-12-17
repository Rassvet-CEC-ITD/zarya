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
    @OneToOne
    private Theme theme;

    @OneToOne
    private Statement statement;

    @ManyToOne
    private Organ organ;

    @OneToMany
    private List<Category> category;

    @Id
    @Column(name = "x_index")
    private int xIndex;

    @Id
    @Column(name = "y_index")
    private int yIndex;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoricalCellId implements Serializable {
        private int xIndex;
        private int yIndex;
    }
}
