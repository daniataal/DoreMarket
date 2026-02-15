'use client';

import { useState } from "react";
import { Deal } from "@prisma/client";
import ClientBuyButton from "@/components/ClientBuyWrapper";
import { Search, Filter, ArrowUpDown } from "lucide-react";

interface AssetGridProps {
    initialDeals: Deal[];
    userBalance: number;
    sellerConfig: any;
    userInfo?: any;
}

export function AssetGrid({ initialDeals, userBalance, sellerConfig, userInfo }: AssetGridProps) {
    const [filter, setFilter] = useState("");
    const [sortBy, setSortBy] = useState<"price" | "quantity" | "date">("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const filteredDeals = initialDeals
        .filter(deal =>
            deal.commodity.toLowerCase().includes(filter.toLowerCase()) ||
            deal.company.toLowerCase().includes(filter.toLowerCase())
        )
        .sort((a, b) => {
            let comparison = 0;
            if (sortBy === "price") {
                comparison = a.pricePerKg - b.pricePerKg;
            } else if (sortBy === "quantity") {
                comparison = a.quantity - b.quantity;
            } else {
                comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            }
            return sortOrder === "asc" ? comparison : -comparison;
        });

    const toggleSort = (field: "price" | "quantity" | "date") => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("desc");
        }
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between bg-card/50 backdrop-blur-md p-4 rounded-xl border border-border/50">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search assets..."
                        className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => toggleSort("price")}
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors border border-transparent ${sortBy === 'price' ? 'bg-primary/10 text-primary border-primary/20' : 'hover:bg-secondary text-muted-foreground'}`}
                    >
                        Price <ArrowUpDown className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => toggleSort("quantity")}
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors border border-transparent ${sortBy === 'quantity' ? 'bg-primary/10 text-primary border-primary/20' : 'hover:bg-secondary text-muted-foreground'}`}
                    >
                        Quantity <ArrowUpDown className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => toggleSort("date")}
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors border border-transparent ${sortBy === 'date' ? 'bg-primary/10 text-primary border-primary/20' : 'hover:bg-secondary text-muted-foreground'}`}
                    >
                        Newest <ArrowUpDown className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDeals.length === 0 ? (
                    <div className="col-span-full py-12 text-center border border-dashed border-border rounded-xl bg-card/30">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
                            <Filter className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">No matching assets</h3>
                        <p className="text-muted-foreground mt-1">Try adjusting your filters</p>
                    </div>
                ) : (
                    filteredDeals.map((deal) => (
                        <div key={deal.id} className="animate-in fade-in zoom-in-95 duration-300">
                            <ClientBuyButton
                                deal={deal}
                                userBalance={userBalance}
                                sellerConfig={sellerConfig}
                                userInfo={userInfo}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
