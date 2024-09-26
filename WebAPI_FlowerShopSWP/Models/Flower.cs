using System;
using System.Collections.Generic;

namespace WebAPI_FlowerShopSWP.Models;

public partial class Flower
{
    public int FlowerId { get; set; }

    public int SellerrId { get; set; }

    public int CategoryId { get; set; }

    public string FlowerName { get; set; } = null!;

    public int Quantity { get; set; }

    public string Condition { get; set; } = null!;

    public decimal Price { get; set; }

    public DateTime? ListingDate { get; set; }

    public string Status { get; set; } = null!;

    public string? ImageUrl { get; set; }

    public virtual Category? Category { get; set; } = null!;

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual User? Seller { get; set; } = null!;
}
