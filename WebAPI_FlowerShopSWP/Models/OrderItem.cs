using System;
using System.Collections.Generic;

namespace WebAPI_FlowerShopSWP.Models;

public partial class OrderItem
{
    public int OrderItemId { get; set; }

    public int OrderId { get; set; }

    public int FlowerId { get; set; }

    public int Quantity { get; set; }

    public decimal Price { get; set; }

    public virtual Flower Flower { get; set; } = null!;

    public virtual Order Order { get; set; } = null!;
}
