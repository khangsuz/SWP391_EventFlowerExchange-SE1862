using System;
using System.Collections.Generic;

namespace WebAPI_FlowerShopSWP.Models;

public partial class Review
{
    public int ReviewId { get; set; }

    public int UserId { get; set; }

    public int FlowerId { get; set; }

    public int Rating { get; set; }

    public string? ReviewComment { get; set; }

    public DateTime? ReviewDate { get; set; }

    public virtual Flower Flower { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
