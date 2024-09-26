using System;
using System.Collections.Generic;

namespace WebAPI_FlowerShopSWP.Models;

public partial class Delivery
{
    public int DeliveryId { get; set; }

    public int OrderId { get; set; }

    public int DeliveryPersonnelId { get; set; }

    public string PickupLocation { get; set; } = null!;

    public string DeliveryAddress { get; set; } = null!;

    public DateTime? DeliveryDate { get; set; }

    public string DeliveryStatus { get; set; } = null!;

    public virtual User DeliveryPersonnel { get; set; } = null!;

    public virtual Order Order { get; set; } = null!;
}
