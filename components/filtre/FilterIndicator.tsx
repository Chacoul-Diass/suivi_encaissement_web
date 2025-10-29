"use client";

import React from 'react';
import { useFilterPersistence } from '@/hooks/useFilterPersistence';
import IconFilter from '../icon/icon-filter';
import Tippy from '@tippyjs/react';

interface FilterIndicatorProps {
    statutValidation: number;
    className?: string;
}

export const FilterIndicator: React.FC<FilterIndicatorProps> = ({
    statutValidation,
    className = ""
}) => {
    const { filters, hasActiveFilters } = useFilterPersistence(statutValidation);

    if (!hasActiveFilters()) {
        return null;
    }
    const filterCount = [
        filters.directionRegional.length,
        filters.codeExpl.length,
        filters.banque.length,
        filters.caisse.length,
        filters.produit.length,
        filters.modeReglement.length,
        filters.dailyCaisse.length,
        filters.startDate ? 1 : 0,
        filters.endDate ? 1 : 0,
        filters.search ? 1 : 0,
    ].reduce((sum, count) => sum + count, 0);

    const getFilterSummary = () => {
        const summary = [];
        if (filters.directionRegional.length) summary.push(`DR: ${filters.directionRegional.length}`);
        if (filters.codeExpl.length) summary.push(`Secteurs: ${filters.codeExpl.length}`);
        if (filters.banque.length) summary.push(`Banques: ${filters.banque.length}`);
        if (filters.caisse.length) summary.push(`Caisses: ${filters.caisse.length}`);
        if (filters.produit.length) summary.push(`Produits: ${filters.produit.length}`);
        if (filters.modeReglement.length) summary.push(`Modes: ${filters.modeReglement.length}`);
        if (filters.startDate) summary.push(`Début: ${filters.startDate}`);
        if (filters.endDate) summary.push(`Fin: ${filters.endDate}`);
        if (filters.search) summary.push(`Recherche: "${filters.search}"`);

        return summary.join(', ');
    };

    return (
        <Tippy content={`Filtres actifs: ${getFilterSummary()}`}>
            <div className={`inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium ${className}`}>
                <IconFilter className="w-3 h-3" />
                <span>{filterCount} filtre{filterCount > 1 ? 's' : ''}</span>
            </div>
        </Tippy>
    );
}; 